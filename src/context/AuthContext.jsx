import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '../lib/api';

// Real server-side auth: login/change-password hit the API, which verifies
// a bcrypt hash and issues a JWT (see ath-ai-server/src/routes/auth.js).
// The token is stored locally and attached to every write by lib/api.js.
// `can()` stays as a client-side convenience for hiding UI the user has no
// edit rights to — the real enforcement now happens server-side on every
// request, not here.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restores a session from a previously-issued token (e.g. after a page
  // reload) by asking the server who it belongs to, rather than trusting
  // anything stored client-side.
  useEffect(() => {
    const token = getToken();
    if (!token) { setReady(true); return; }
    apiFetch('/api/auth/me')
      .then((res) => setCurrentUser(res.user))
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  const isAuthed = !!currentUser;

  const login = async (username, password) => {
    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: { username, password } });
      setToken(res.token);
      setCurrentUser(res.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearToken();
    setCurrentUser(null);
  };

  const changeOwnPassword = async (currentPassword, newPassword) => {
    try {
      const res = await apiFetch('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
      setCurrentUser(res.user);
      return true;
    } catch {
      return false;
    }
  };

  // resource: one of PERMISSION_RESOURCES (see seedData.js); action: 'view' | 'edit'
  const can = (resource, action = 'view') => !!currentUser?.permissions?.[resource]?.[action];

  if (!ready) return null; // brief gate while a stored token is validated against the server

  return (
    <AuthContext.Provider value={{ isAuthed, currentUser, login, logout, changeOwnPassword, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
