-- Comptes des amis : à exécuter une fois dans Supabase > SQL Editor, après schema.sql.
-- La veille devient privée : on crée son compte sur le site avec un code d'invitation,
-- et seuls les membres (veille_invites) peuvent la lire.

-- 1. Les codes d'invitation et la liste des membres (modifiables seulement depuis Supabase)
create table veille_codes (
  code       text primary key,
  created_at timestamptz not null default now()
);
insert into veille_codes (code) values ('CHOISIS-TON-CODE');  -- le code à donner à tes amis (il ne doit pas rester dans le dépôt)

create table veille_invites (
  email    text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table veille_codes enable row level security;    -- aucune règle : invisibles depuis le site
alter table veille_invites enable row level security;

-- Gabin est invité d'office (le propriétaire des fiches du Codex)
insert into veille_invites (email)
  select distinct lower(u.email) from auth.users u join media m on m.owner_id = u.id;

-- Le compte connecté est-il invité ? (appelé par les règles et par le site)
create function veille_is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.veille_invites where email = lower(auth.jwt() ->> 'email'))
$$;

-- 2. Lecture réservée aux invités connectés
drop policy "lecture publique" on veille_articles;
drop policy "lecture publique" on veille_editions;
drop policy "lecture publique" on veille_topics;
create policy "lecture par les invités" on veille_articles for select to authenticated using (veille_is_member());
create policy "lecture par les invités" on veille_editions for select to authenticated using (veille_is_member());
create policy "lecture par les invités" on veille_topics for select to authenticated using (veille_is_member());

-- 3. Création de compte seulement avec un bon code (envoyé par le site dans user_metadata.code_invitation),
-- ou pour une adresse ajoutée à la main dans veille_invites.
-- À activer ensuite : Authentication > Hooks > « Before User Created » > Postgres > public.veille_avant_inscription
create function veille_avant_inscription(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.veille_codes where code = trim(event -> 'user' -> 'user_metadata' ->> 'code_invitation'))
     or exists (select 1 from public.veille_invites where email = lower(event -> 'user' ->> 'email')) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'Code d''invitation invalide'));
end $$;
revoke execute on function veille_avant_inscription from public, anon, authenticated;
grant execute on function veille_avant_inscription to supabase_auth_admin;

-- Un compte créé avec un bon code devient membre ; supprimer sa ligne de veille_invites lui retire l'accès
create function veille_nouveau_compte() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.veille_codes where code = trim(new.raw_user_meta_data ->> 'code_invitation')) then
    insert into public.veille_invites (email) values (lower(new.email)) on conflict do nothing;
  end if;
  return new;
end $$;
create trigger veille_nouveau_compte after insert on auth.users
  for each row execute function veille_nouveau_compte();

-- 4. Le Codex partage cette base : ses fiches ne restent modifiables que par Gabin, pas par les amis.
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"codex": true}'
  where id in (select owner_id from media);

drop policy "ajout par le propriétaire" on media;
drop policy "modification par le propriétaire" on media;
drop policy "suppression par le propriétaire" on media;
create policy "ajout par le propriétaire" on media for insert to authenticated
  with check (owner_id = auth.uid() and (auth.jwt() -> 'app_metadata' ->> 'codex') = 'true');
create policy "modification par le propriétaire" on media for update to authenticated
  using (owner_id = auth.uid() and (auth.jwt() -> 'app_metadata' ->> 'codex') = 'true')
  with check (owner_id = auth.uid());
create policy "suppression par le propriétaire" on media for delete to authenticated
  using (owner_id = auth.uid() and (auth.jwt() -> 'app_metadata' ->> 'codex') = 'true');

-- Vérification : ton adresse doit apparaître ici
select email from veille_invites;
