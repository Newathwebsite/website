import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { uid, slugify } from '../lib/storage';
import { useAuth } from './AuthContext';

export const DataContext = createContext(null);

// Fetches a collection from the real API on mount and keeps a local copy in
// state. Every mutator below updates that local copy immediately (so the UI
// feels exactly as instant as the old localStorage version) and fires the
// matching API call in the background — the server is now the source of
// truth, but the admin never has to wait on a network round-trip to see
// their own edit reflected. A failed background call is logged; the local
// state simply stays ahead of the server until the next full reload
// reconciles it (a known simplification — see the migration plan).
// `skip` lets the public build opt out of fetching admin-only collections
// (users, trash) that it never renders — it would otherwise fire a request
// that's just going to 401/403 for every anonymous visitor.
//
// `refetchKey` re-runs the fetch whenever it changes — needed for `users`
// and `trash`, whose GET requires auth: on first mount (e.g. a fresh tab
// with no stored token yet) that request 401s before login has resolved,
// and without this the collection would stay stuck empty forever once
// logged in, since the effect only ran once. Passing `isAuthed` here means
// login flipping true re-fires the fetch with the now-valid token.
function useApiCollection(apiResource, { skip = false, refetchKey } = {}) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(skip);

  useEffect(() => {
    if (skip) return;
    let cancelled = false;
    apiFetch(`/api/${apiResource}`)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((err) => console.error(`[api] load ${apiResource} failed:`, err))
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, refetchKey]);

  return [items, setItems, loaded];
}

function useApiSettings() {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch('/api/settings')
      .then(setSettings)
      .catch((err) => console.error('[api] load settings failed:', err))
      .finally(() => setLoaded(true));
  }, []);

  return [settings, setSettings, loaded];
}

// Generic id-keyed CRUD for the collections that don't need special-cased
// add() defaults (projects/pages/blog/landingPages do, since they derive a
// slug from a title). `apiResource` is the REST path segment — it doesn't
// always match the frontend's collection name (blogPosts -> /api/blog,
// jobOpenings -> /api/careers), matching the trash-type aliases those two
// already used.
function makeCrud(setItems, apiResource, idPrefix) {
  return {
    add: (data) => {
      const item = { id: data.id || uid(idPrefix), ...data };
      setItems((prev) => [...prev, item]);
      apiFetch(`/api/${apiResource}`, { method: 'POST', body: item }).catch((err) => console.error(`[api] create ${apiResource} failed:`, err));
      return item;
    },
    update: (id, patch) => {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      apiFetch(`/api/${apiResource}/${id}`, { method: 'PATCH', body: patch }).catch((err) => console.error(`[api] update ${apiResource} failed:`, err));
    },
    remove: (id) => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      apiFetch(`/api/${apiResource}/${id}`, { method: 'DELETE' }).catch((err) => console.error(`[api] delete ${apiResource} failed:`, err));
    },
  };
}

function makeReorder(setItems, apiResource) {
  return (next) => {
    setItems(next);
    apiFetch(`/api/${apiResource}/reorder`, { method: 'POST', body: { order: next.map((x) => x.id) } })
      .catch((err) => console.error(`[api] reorder ${apiResource} failed:`, err));
  };
}

// The public build never renders Users or Trash admin screens — skip
// fetching them so an anonymous visitor doesn't fire requests that just
// 401/403 (see resourceConfig's write-only design and users.js's view guard).
const IS_PUBLIC_BUILD = import.meta.env.VITE_BUILD_TARGET === 'public';

export function DataProvider({ children }) {
  const { isAuthed } = useAuth();
  const [projects, setProjects, projectsLoaded] = useApiCollection('projects');
  const [pages, setPages, pagesLoaded] = useApiCollection('pages');
  const [testimonials, setTestimonials, testimonialsLoaded] = useApiCollection('testimonials');
  const [newsEvents, setNewsEvents, newsEventsLoaded] = useApiCollection('newsEvents');
  const [jobOpenings, setJobOpenings, jobOpeningsLoaded] = useApiCollection('careers');
  const [blogPosts, setBlogPosts, blogPostsLoaded] = useApiCollection('blog');
  const [media, setMedia, mediaLoaded] = useApiCollection('media');
  const [landingPages, setLandingPages, landingPagesLoaded] = useApiCollection('landingPages');
  const [users, setUsers, usersLoaded] = useApiCollection('users', { skip: IS_PUBLIC_BUILD, refetchKey: isAuthed });
  const [forms, setForms, formsLoaded] = useApiCollection('forms');
  const [settings, setSettings, settingsLoaded] = useApiSettings();
  const [trash, setTrash, trashLoaded] = useApiCollection('trash', { skip: IS_PUBLIC_BUILD, refetchKey: isAuthed });

  const loaded = projectsLoaded && pagesLoaded && testimonialsLoaded && newsEventsLoaded && jobOpeningsLoaded
    && blogPostsLoaded && mediaLoaded && landingPagesLoaded && usersLoaded && formsLoaded && settingsLoaded && trashLoaded;

  // Every "type" here maps to one of the setters above — restoreFromTrash
  // pushes the original record straight back into its local collection (its
  // id/slug were kept in the trashed copy, so it reappears exactly as it
  // was) once the server confirms the restore.
  const RESTORE_SETTERS = {
    projects: setProjects, pages: setPages, blog: setBlogPosts, landingPages: setLandingPages,
    testimonials: setTestimonials, newsEvents: setNewsEvents, careers: setJobOpenings,
    forms: setForms, media: setMedia, users: setUsers,
  };
  const moveToTrash = (type, item) => {
    const entry = { id: uid('trash'), type, item, deletedAt: new Date().toISOString() };
    setTrash((prev) => [entry, ...prev]);
    apiFetch('/api/trash', { method: 'POST', body: { type, item } }).catch((err) => console.error('[api] move to trash failed:', err));
    return entry;
  };
  const restoreFromTrash = (trashId) => {
    const entry = trash.find((t) => t.id === trashId);
    if (!entry) return;
    RESTORE_SETTERS[entry.type]?.((prev) => [...prev, entry.item]);
    setTrash((prev) => prev.filter((t) => t.id !== trashId));
    apiFetch(`/api/trash/${trashId}/restore`, { method: 'POST' }).catch((err) => console.error('[api] restore from trash failed:', err));
  };
  const purgeTrashItem = (trashId) => {
    setTrash((prev) => prev.filter((t) => t.id !== trashId));
    apiFetch(`/api/trash/${trashId}`, { method: 'DELETE' }).catch((err) => console.error('[api] purge trash item failed:', err));
  };
  const emptyTrash = () => {
    setTrash([]);
    apiFetch('/api/trash', { method: 'DELETE' }).catch((err) => console.error('[api] empty trash failed:', err));
  };

  const testimonialsCrud = makeCrud(setTestimonials, 'testimonials', 'test');
  const newsEventsCrud = makeCrud(setNewsEvents, 'newsEvents', 'news');
  const jobOpeningsCrud = makeCrud(setJobOpenings, 'careers', 'job');
  const blogCrud = makeCrud(setBlogPosts, 'blog', 'blog');
  const mediaCrud = makeCrud(setMedia, 'media', 'media');
  const formsCrud = makeCrud(setForms, 'forms', 'form');

  const api = useMemo(
    () => ({
      loaded,

      // ---- projects ----
      projects,
      addProject: (data) => {
        const project = { id: uid('proj'), slug: slugify(data.name || 'project'), published: true, ...data };
        setProjects((prev) => [...prev, project]);
        apiFetch('/api/projects', { method: 'POST', body: project }).catch((err) => console.error('[api] create project failed:', err));
        return project;
      },
      updateProject: (id, patch) => {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
        apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: patch }).catch((err) => console.error('[api] update project failed:', err));
      },
      removeProject: (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        apiFetch(`/api/projects/${id}`, { method: 'DELETE' }).catch((err) => console.error('[api] remove project failed:', err));
      },
      reorderProjects: makeReorder(setProjects, 'projects'),

      // ---- pages (keyed by slug, not id) ----
      pages,
      addPage: (data) => {
        const page = { slug: slugify(data.title || 'page'), sections: [], ...data };
        setPages((prev) => [...prev, page]);
        apiFetch('/api/pages', { method: 'POST', body: page }).catch((err) => console.error('[api] create page failed:', err));
        return page;
      },
      updatePage: (slug, patch) => {
        setPages((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...patch } : p)));
        apiFetch(`/api/pages/${slug}`, { method: 'PATCH', body: patch }).catch((err) => console.error('[api] update page failed:', err));
      },
      removePage: (slug) => {
        setPages((prev) => prev.filter((p) => p.slug !== slug));
        apiFetch(`/api/pages/${slug}`, { method: 'DELETE' }).catch((err) => console.error('[api] remove page failed:', err));
      },
      replacePages: (next) => {
        setPages(next);
        // Pages have no bulk-reorder endpoint (order isn't meaningful for
        // them) — this is only ever called after per-slug edits already
        // persisted, so nothing further to send.
      },

      // ---- testimonials ----
      testimonials,
      addTestimonial: testimonialsCrud.add,
      updateTestimonial: testimonialsCrud.update,
      removeTestimonial: testimonialsCrud.remove,
      reorderTestimonials: makeReorder(setTestimonials, 'testimonials'),

      // ---- news & events ----
      newsEvents,
      addNewsEvent: newsEventsCrud.add,
      updateNewsEvent: newsEventsCrud.update,
      removeNewsEvent: newsEventsCrud.remove,
      reorderNewsEvents: makeReorder(setNewsEvents, 'newsEvents'),

      // ---- job openings ----
      jobOpenings,
      addJobOpening: jobOpeningsCrud.add,
      updateJobOpening: jobOpeningsCrud.update,
      removeJobOpening: jobOpeningsCrud.remove,

      // ---- blog ----
      blogPosts,
      addBlogPost: (data) => {
        const post = { id: uid('blog'), slug: slugify(data.title || 'post'), published: true, date: new Date().toISOString().slice(0, 10), ...data };
        setBlogPosts((prev) => [...prev, post]);
        apiFetch('/api/blog', { method: 'POST', body: post }).catch((err) => console.error('[api] create blog post failed:', err));
        return post;
      },
      updateBlogPost: blogCrud.update,
      removeBlogPost: blogCrud.remove,
      reorderBlogPosts: makeReorder(setBlogPosts, 'blog'),

      // ---- media library ----
      media,
      addMedia: mediaCrud.add,
      updateMedia: mediaCrud.update,
      removeMedia: mediaCrud.remove,

      // ---- landing pages (campaign pages, optionally on a subdomain) ----
      landingPages,
      addLandingPage: (data) => {
        const lp = { id: uid('lp'), slug: slugify(data.name || 'landing-page'), sections: [], published: true, ...data };
        setLandingPages((prev) => [...prev, lp]);
        apiFetch('/api/landingPages', { method: 'POST', body: lp }).catch((err) => console.error('[api] create landing page failed:', err));
        return lp;
      },
      updateLandingPage: (id, patch) => {
        setLandingPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
        apiFetch(`/api/landingPages/${id}`, { method: 'PATCH', body: patch }).catch((err) => console.error('[api] update landing page failed:', err));
      },
      removeLandingPage: (id) => {
        setLandingPages((prev) => prev.filter((p) => p.id !== id));
        apiFetch(`/api/landingPages/${id}`, { method: 'DELETE' }).catch((err) => console.error('[api] remove landing page failed:', err));
      },
      replaceLandingPages: (next) => setLandingPages(next),

      // ---- users (roles & permissions) — passwords are write-only: sent to
      // the API to be hashed, never kept in local state or read back. ----
      users,
      addUser: (data) => {
        const { password, ...rest } = data;
        const user = { id: uid('user'), ...rest };
        setUsers((prev) => [...prev, user]);
        apiFetch('/api/users', { method: 'POST', body: data }).catch((err) => console.error('[api] create user failed:', err));
        return user;
      },
      updateUser: (id, patch) => {
        const { password, ...rest } = patch;
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...rest } : u)));
        apiFetch(`/api/users/${id}`, { method: 'PATCH', body: patch }).catch((err) => console.error('[api] update user failed:', err));
      },
      removeUser: (id) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        apiFetch(`/api/users/${id}`, { method: 'DELETE' }).catch((err) => console.error('[api] remove user failed:', err));
      },

      // ---- custom enquiry forms ----
      forms,
      addForm: formsCrud.add,
      updateForm: formsCrud.update,
      removeForm: formsCrud.remove,

      // ---- settings ----
      settings,
      updateSettings: (patch) => {
        setSettings((prev) => ({ ...prev, ...patch }));
        apiFetch('/api/settings', { method: 'PATCH', body: patch }).catch((err) => console.error('[api] update settings failed:', err));
      },

      // ---- trash (soft-delete for every collection above) ----
      trash,
      moveToTrash,
      restoreFromTrash,
      purgeTrashItem,
      emptyTrash,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded, projects, pages, testimonials, newsEvents, jobOpenings, blogPosts, media, landingPages, users, forms, settings, trash]
  );

  if (!loaded) return null; // brief gate while the initial API fetch resolves

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
