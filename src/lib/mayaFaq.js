// Maya's scripted FAQ — answers come from a keyword table built off real
// project data already in the CMS, never a live AI backend, so she can't
// invent anything outside it.

function buildFaqTable(projects) {
  const villaNames = () => projects.filter((p) => p.category === 'villa').map((p) => `${p.name} (${p.location})`).join(', ');
  const aptNames = () => projects.filter((p) => p.category === 'apartment').map((p) => `${p.name} (${p.location})`).join(', ');

  return [
    { kw: ['hello', 'hi ', 'hi,', 'hey', 'namaste', 'good morning', 'good evening'], a: "Hi, I'm Maya! Ask me about our villas, apartments, pricing, or how to book a site visit." },
    { kw: ['project', 'projects', 'communities', 'listing'], a: () => `We have ${projects.length} ongoing projects: ${projects.map((p) => p.name).join(', ')}. Ask about "villas" or "apartments", or a project by name.` },
    { kw: ['villa'], a: () => `Our villa projects: ${villaNames()}. ATH Feathers in Kundrathur is our flagship — the only gated villa community there.` },
    { kw: ['apartment', 'flat'], a: () => `Our apartment projects: ${aptNames()}.` },
    { kw: ['feathers'], a: 'ATH Feathers is our flagship villa project in Kundrathur — the only gated community villas there. 3 BHK from ₹1.40 Cr, 4 BHK from ₹1.63 Cr. 5 minutes to ORR, 20 minutes to the airport.' },
    { kw: ['price', 'pricing', 'cost', 'budget', 'rate'], a: "ATH Feathers villas start at ₹1.40 Cr for 3 BHK and ₹1.63 Cr for 4 BHK. Pricing for our other projects varies by unit — our sales team can share the latest rates if you get in touch." },
    { kw: ['contact', 'phone', 'number', 'call', 'email', 'reach'], a: 'You can reach us at +91 89398 56789 or sales@assettreehomes.com.' },
    { kw: ['visit', 'tour', 'book'], a: 'You can book a site visit through our Contact page — share your details and our team will call you back within one business day.' },
    { kw: ['location', 'address', 'where'], a: 'Our sales gallery is at ATH Feathers, Kundrathur, Chennai. Our projects span Kundrathur, East Tambaram, Chromepet, Pammal, Madambakkam and Ekkaduthangal.' },
    { kw: ['credai', 'about', 'experience', 'years', 'trust', 'who are you', 'company'], a: 'Asset Tree Homes is a CREDAI member developer with 20+ years of expertise, 100+ completed projects and 1000+ happy customers across Chennai.' },
    { kw: ['nri'], a: 'We have a dedicated NRI Corner for buyers investing from abroad — virtual site tours, documentation support and a single point of contact.' },
    { kw: ['partner', 'broker', 'agent'], a: 'Channel partners can sign in through our partner portal at iris.assettreehomes.com, or register interest on our Channel Partner page.' },
    { kw: ['career', 'job'], a: "No specific openings are listed right now — reach out through our Careers page and our team will get back to you when a relevant role opens." },
    { kw: ['thank'], a: "You're welcome! Anything else you'd like to know?" },
    { kw: ['bye', 'goodbye'], a: 'Thanks for chatting! Feel free to come back anytime.' },
  ];
}

const FALLBACK = "I don't have that answer yet — call us at +91 89398 56789 or use the Contact page and our team will help.";

export function mayaAnswer(question, projects) {
  const text = (question || '').toLowerCase();
  const table = buildFaqTable(projects);
  for (const rule of table) {
    if (rule.kw.some((k) => text.includes(k))) {
      return typeof rule.a === 'function' ? rule.a() : rule.a;
    }
  }
  return FALLBACK;
}

export function priceStat(project) {
  return project.stats?.find((s) => /price/i.test(s.l)) || null;
}

export function projectDetailLines(project) {
  const lines = [`${project.name} — ${project.location}`];
  if (project.stats?.length) lines.push(project.stats.map((s) => `${s.v} ${s.l}`).join(' · '));
  if (project.description) lines.push(project.description);
  if (project.amenities?.length) lines.push(`Amenities: ${project.amenities.join(', ')}.`);
  if (project.media && (project.media.walkthrough || project.media.hometour || project.media.gmap)) {
    lines.push('A walkthrough video, floor plans and route map are available on the project page.');
  }
  lines.push('For more queries, call us at +91 89398 56789.');
  return lines;
}
