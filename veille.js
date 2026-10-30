import { edition } from './data.js';

// Sujets lus et gardés « pour plus tard », mémorisés dans ce navigateur
const load = key => { try { return new Set(JSON.parse(localStorage.getItem('veille:' + key)) || []); } catch { return new Set(); } };
const store = (key, set) => { try { localStorage.setItem('veille:' + key, JSON.stringify([...set])); } catch {} };
const state = { read: load('read'), saved: load('saved') };

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...children);
  return el;
};

const savedCount = document.getElementById('saved-count');
const showSaved = () => { savedCount.textContent = state.saved.size || ''; };

const topic = (themeId, [title, sum, src], i) => {
  const id = themeId + '-' + i;
  const art = h('article', { class: 'topic' });
  const sources = h('div', { class: 'sources' }, ...src.slice(0, 3).map(s => h('a', { href: '#' }, s)));
  if (src.length > 3) sources.append(h('span', {}, '+' + (src.length - 3)));
  const save = h('button', { type: 'button', class: 'save' });
  const read = h('button', { type: 'button', class: 'read' });
  const sync = () => {
    const isRead = state.read.has(id), isSaved = state.saved.has(id);
    art.classList.toggle('is-read', isRead);
    read.setAttribute('aria-pressed', isRead);
    read.textContent = isRead ? 'Non lu' : 'Lu';
    save.setAttribute('aria-pressed', isSaved);
    save.textContent = isSaved ? 'Gardé' : 'Plus tard';
  };
  const toggle = key => () => {
    state[key].has(id) ? state[key].delete(id) : state[key].add(id);
    store(key, state[key]);
    sync();
    showSaved();
  };
  save.addEventListener('click', toggle('saved'));
  read.addEventListener('click', toggle('read'));
  sync();
  art.append(
    h('span', { class: 'topic-n', 'aria-hidden': 'true' }, String(i + 1)),
    h('div', { class: 'topic-body' },
      h('h3', {}, h('a', { href: '#' }, title)),
      h('p', { class: 'topic-sum' }, sum),
      h('div', { class: 'topic-foot' }, sources, h('div', { class: 'actions' }, save, read))
    )
  );
  return art;
};

const theme = th => h('section', { class: 'theme', id: th.id },
  h('header', { class: 'theme-head' },
    h('span', { class: 'theme-glyph', 'aria-hidden': 'true' }, th.glyph),
    h('div', { class: 'theme-label' },
      h('h2', {}, th.name),
      h('span', { class: 'theme-meta' }, `${th.topics.length} sujets · ${th.articles} articles`),
      h('a', { href: '#', class: 'theme-thread' }, 'Voir le fil →')
    )
  ),
  h('div', { class: 'topics' }, ...th.topics.map((t, i) => topic(th.id, t, i)))
);

document.getElementById('date').textContent = edition.date;
document.getElementById('digest').textContent = edition.digest;
document.getElementById('stats').textContent = edition.stats;
document.getElementById('theme-nav').append(...edition.themes.map(th => h('a', { href: '#' + th.id }, th.name)));
document.getElementById('themes').append(...edition.themes.map(theme));
showSaved();
