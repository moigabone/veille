import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const db = createClient(SUPABASE_URL, SUPABASE_KEY);
const THEMES = [
  ['tech', 'Tech', 'T'], ['cyber', 'Cyber', 'C'], ['ia', 'IA', 'IA'], ['finance', 'Finance', 'F'],
  ['eco', 'Économie', 'É'], ['politique', 'Politique', 'P'], ['monde', 'Monde', 'M'],
];
const THEME_NAME = Object.fromEntries(THEMES.map(([id, name]) => [id, name]));
const view = new URLSearchParams(location.search).get('vue') || 'recap';
const $ = id => document.getElementById(id);

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...children);
  return el;
};
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// --- Sujets lus et gardés, par compte ---

let user = null;
const marks = { lu: new Set(), garde: new Set() };

async function loadMarks() {
  const { data, error } = await db.from('veille_marks').select('topic_id, kind');
  if (error) return console.error(error);
  marks.lu = new Set(data.filter(m => m.kind === 'lu').map(m => m.topic_id));
  marks.garde = new Set(data.filter(m => m.kind === 'garde').map(m => m.topic_id));
}

async function toggleMark(kind, id) {
  const on = !marks[kind].has(id);
  on ? marks[kind].add(id) : marks[kind].delete(id);
  const { error } = on
    ? await db.from('veille_marks').insert({ topic_id: id, kind })
    : await db.from('veille_marks').delete().match({ topic_id: id, kind });
  if (error) { // on revient en arrière pour rester fidèle à la base
    on ? marks[kind].delete(id) : marks[kind].add(id);
    console.error(error);
  }
}

const showSaved = () => { $('saved-count').textContent = marks.garde.size || ''; };

// --- Affichage ---

const topic = (t, i, label) => {
  const art = h('article', { class: 'topic' });
  const first = t.sources[0];
  const ext = { target: '_blank', rel: 'noopener' };
  const sources = h('div', { class: 'sources' },
    ...t.sources.slice(0, 3).map(s => h('a', { href: s.url, title: s.title, ...ext }, s.name)));
  if (t.sources.length > 3) sources.append(h('span', {}, '+' + (t.sources.length - 3)));
  const save = h('button', { type: 'button', class: 'save' });
  const read = h('button', { type: 'button', class: 'read' });
  const sync = () => {
    const isRead = marks.lu.has(t.id), isSaved = marks.garde.has(t.id);
    art.classList.toggle('is-read', isRead);
    read.setAttribute('aria-pressed', isRead);
    read.textContent = isRead ? 'Non lu' : 'Lu';
    save.setAttribute('aria-pressed', isSaved);
    save.textContent = isSaved ? 'Gardé' : 'Plus tard';
  };
  const toggle = kind => async () => {
    const pending = toggleMark(kind, t.id);
    sync();
    showSaved();
    await pending;
    sync();
    showSaved();
  };
  save.addEventListener('click', toggle('garde'));
  read.addEventListener('click', toggle('lu'));
  sync();
  const body = h('div', { class: 'topic-body' });
  if (label) body.append(h('p', { class: 'topic-label' }, label));
  body.append(
    h('h3', {}, first ? h('a', { href: first.url, ...ext }, t.title) : t.title),
    h('p', { class: 'topic-sum' }, t.summary),
  );
  if (t.note) body.append(h('p', { class: 'topic-note' }, t.note));
  body.append(h('div', { class: 'topic-foot' }, sources, h('div', { class: 'actions' }, save, read)));
  art.append(h('span', { class: 'topic-n', 'aria-hidden': 'true' }, String(i + 1)), body);
  return art;
};

const section = (id, name, glyph, meta, items) => h('section', { class: 'theme', id },
  h('header', { class: 'theme-head' },
    h('span', { class: 'theme-glyph', 'aria-hidden': 'true' }, glyph),
    h('div', { class: 'theme-label' }, h('h2', {}, name), h('span', { class: 'theme-meta' }, meta)),
  ),
  h('div', { class: 'topics' }, ...items),
);

const empty = message => h('p', { class: 'empty' }, message);

const longDate = d => {
  const s = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(d + 'T00:00:00Z'));
  return s[0].toUpperCase() + s.slice(1);
};
const clock = ts => {
  const [hh, mm] = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
    .format(new Date(ts)).split(':');
  return `${Number(hh)} h ${mm}`;
};

// Résumé du jour, raccourci à trois lignes si on le préfère (choix gardé dans ce navigateur)
function showDigest(textContent) {
  const digest = $('digest'), toggle = $('digest-toggle');
  let short = true;
  try { short = localStorage.getItem('veille:resume') !== 'long'; } catch {}
  const apply = () => {
    digest.classList.toggle('is-short', short);
    toggle.textContent = short ? 'Lire tout le résumé' : 'Raccourcir le résumé';
    toggle.setAttribute('aria-expanded', !short);
  };
  digest.textContent = textContent;
  digest.hidden = false;
  apply();
  // Pas de bouton si le résumé tient déjà en trois lignes
  if (short && digest.scrollHeight <= digest.clientHeight + 1) return digest.classList.remove('is-short');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    short = !short;
    try { localStorage.setItem('veille:resume', short ? 'court' : 'long'); } catch {}
    apply();
  });
}

async function showRecap() {
  const { data: ed, error } = await db.from('veille_editions')
    .select('*').order('edition_date', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!ed) {
    $('eyebrow').textContent = 'Bientôt';
    $('content').append(empty('La première édition arrive demain matin.'));
    return;
  }
  const { data: topics, error: tErr } = await db.from('veille_topics')
    .select('*').eq('edition_id', ed.id).order('rank');
  if (tErr) throw tErr;

  $('eyebrow').textContent = longDate(ed.edition_date);
  showDigest(ed.digest);
  $('stats').textContent = `${plural(ed.article_count, 'article')} · ${plural(ed.source_count, 'source')} · édition de ${clock(ed.created_at)}`;
  $('stats').hidden = false;

  const themes = THEMES.filter(([id]) => topics.some(t => t.theme === id));
  $('theme-nav').append(...themes.map(([id, name]) => h('a', { href: '#' + id }, name)));
  $('theme-nav').hidden = false;
  $('content').append(...themes.map(([id, name, glyph]) => {
    const list = topics.filter(t => t.theme === id);
    const meta = `${plural(list.length, 'sujet')} · ${plural(ed.theme_counts[id] ?? 0, 'article')}`;
    return section(id, name, glyph, meta, list.map((t, i) => topic(t, i)));
  }));
}

async function showSavedTopics() {
  $('eyebrow').textContent = 'Gardés pour plus tard';
  const ids = [...marks.garde];
  const { data, error } = ids.length
    ? await db.from('veille_topics').select('*, veille_editions(edition_date)').in('id', ids).order('id', { ascending: false })
    : { data: [] };
  if (error) throw error;
  if (!data.length) return $('content').append(empty('Rien de gardé pour l’instant : touche « Plus tard » sur un sujet pour le retrouver ici.'));
  const label = t => `${THEME_NAME[t.theme] ?? t.theme} · ${longDate(t.veille_editions.edition_date)}`;
  $('content').append(section('plus-tard', 'Plus tard', '★', plural(data.length, 'sujet'), data.map((t, i) => topic(t, i, label(t)))));
}

async function showSources() {
  $('eyebrow').textContent = 'Les flux suivis chaque matin';
  const sources = await (await fetch('sources.json')).json();
  $('content').append(...THEMES.map(([id, name, glyph]) => {
    const list = sources.filter(s => s.theme === id);
    return section(id, name, glyph, plural(list.length, 'source'), list.map(s => h('p', { class: 'source-row' },
      h('a', { href: new URL(s.url).origin, target: '_blank', rel: 'noopener' }, s.name),
      s.bord ? h('span', {}, s.bord) : '')));
  }));
}

// --- Connexion par code e-mail, réservée aux adresses invitées (liste veille_invites dans Supabase) ---

function showGate(message, withLogin) {
  $('eyebrow').textContent = 'Veille privée';
  const box = h('div', { class: 'gate' }, h('p', {}, message));
  if (withLogin) {
    const open = h('button', { type: 'button' }, 'Se connecter');
    open.addEventListener('click', () => $('login').showModal());
    box.append(open);
  }
  $('content').append(box);
}

function showAccount() {
  const p = $('account');
  if (!user) return;
  const out = h('button', { type: 'button', class: 'link-button' }, 'Déconnexion');
  out.addEventListener('click', async () => { await db.auth.signOut(); location.reload(); });
  p.replaceChildren(`Connecté · ${user.email} · `, out);
}

function setupLogin() {
  const dialog = $('login'), emailForm = $('login-email'), codeForm = $('login-code'), err = $('login-error');
  const fail = message => { err.textContent = message; err.hidden = false; };
  let email = '';
  $('login-open').addEventListener('click', () => dialog.showModal());
  dialog.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
  emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    err.hidden = true;
    email = emailForm.email.value.trim();
    // Le compte est créé à la première connexion, si le code d'invitation est bon (sinon Supabase refuse)
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { code_invitation: emailForm.invite.value.trim() } },
    });
    if (error) return fail(error.status === 429 ? 'Trop de demandes : réessaie dans une minute.'
      : /invit/i.test(error.message) ? 'Code d’invitation incorrect. Demande-le à Gabin.'
      : error.message);
    emailForm.hidden = true;
    codeForm.hidden = false;
    codeForm.code.focus();
  });
  codeForm.addEventListener('submit', async e => {
    e.preventDefault();
    err.hidden = true;
    const { error } = await db.auth.verifyOtp({ email, token: codeForm.code.value.trim(), type: 'email' });
    if (error) return fail('Code invalide ou expiré.');
    location.reload();
  });
}

// --- Démarrage ---

document.querySelector(`[data-view="${view}"]`)?.setAttribute('aria-current', 'page');
setupLogin();
({ data: { user } } = await db.auth.getUser());
showAccount();
try {
  if (view === 'sources') await showSources(); // la liste des flux reste publique
  else if (!user) showGate('La veille est réservée à mes amis. Pour ta première connexion, il te faut le code d’invitation que je t’ai donné.', true);
  else if (!(await db.rpc('veille_is_member')).data) showGate('Ce compte n’est pas sur la liste des invités.', false);
  else {
    await loadMarks();
    showSaved();
    if (view === 'plus-tard') await showSavedTopics();
    else await showRecap();
  }
} catch (err) {
  console.error(err);
  $('content').append(empty('Impossible de charger la veille pour le moment.'));
}
