-- À exécuter dans Supabase > SQL Editor (même projet que le Codex)

-- Articles récupérés dans les flux RSS : titre, chapô et lien seulement, jamais le texte complet
create table veille_articles (
  id           bigint generated always as identity primary key,
  url          text not null unique,
  theme        text not null,
  source       text not null,
  title        text not null,
  snippet      text,
  published_at timestamptz,
  fetched_at   timestamptz not null default now()
);

create index veille_articles_fetched on veille_articles (fetched_at desc);

-- Une édition par jour : le résumé global et les chiffres
create table veille_editions (
  id            bigint generated always as identity primary key,
  edition_date  date not null unique,
  digest        text not null,
  article_count int not null,
  source_count  int not null,
  theme_counts  jsonb not null default '{}',  -- articles lus par thème, ex. {"tech": 24}
  created_at    timestamptz not null default now()
);

-- Les sujets du jour, regroupés par l'IA : sources = [{ "name", "title", "url" }]
create table veille_topics (
  id         bigint generated always as identity primary key,
  edition_id bigint not null references veille_editions(id) on delete cascade,
  theme      text not null,
  rank       smallint not null,
  title      text not null,
  summary    text not null,
  note       text,  -- ex. sujet couvert par un seul bord politique
  sources    jsonb not null default '[]'
);

create index veille_topics_edition on veille_topics (edition_id, theme, rank);

-- Sujets lus ou gardés pour plus tard, par compte
create table veille_marks (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  topic_id   bigint not null references veille_topics(id) on delete cascade,
  kind       text not null check (kind in ('lu', 'garde')),
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id, kind)
);

-- Sécurité : lecture publique de la veille, écriture réservée à la collecte (clé service_role, qui contourne la RLS)
alter table veille_articles enable row level security;
alter table veille_editions enable row level security;
alter table veille_topics enable row level security;
alter table veille_marks enable row level security;

create policy "lecture publique" on veille_articles for select using (true);
create policy "lecture publique" on veille_editions for select using (true);
create policy "lecture publique" on veille_topics for select using (true);

-- Les marques ne sont visibles et modifiables que par leur propriétaire
create policy "lecture par le propriétaire" on veille_marks
  for select to authenticated using (user_id = auth.uid());
create policy "ajout par le propriétaire" on veille_marks
  for insert to authenticated with check (user_id = auth.uid());
create policy "suppression par le propriétaire" on veille_marks
  for delete to authenticated using (user_id = auth.uid());
