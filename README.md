# Veille

Récap du jour de ma veille personnelle : un résumé global, puis les sujets importants par thème,
sous la rue médiévale 3D de la taverne, dans le style « Codex Nuit ».

## Fonctionnement

1. **Chaque matin** (5 h 30 UTC, lancée par Supabase pg_cron via `supabase/declencheur.sql`, avec le planning
   GitHub Actions en secours car il arrive souvent en retard), `collector/collect.mjs` lit les flux RSS de `sources.json`
   et garde les articles des dernières 26 h, sans doublons.
2. **Claude** regroupe, thème par thème, les articles qui parlent du même sujet, garde les 3 à 5 plus importants
   et les résume en français, à partir des titres et chapôs seulement. Il signale aussi un sujet politique
   couvert par un seul bord. Un dernier appel rédige le résumé global.
3. **Supabase** (le même projet que le Codex) stocke les articles, l'édition du jour et ses sujets.
   Relancer la collecte le même jour remplace l'édition, en reportant les Lu / Plus tard sur les nouveaux sujets
   (même thème, liens en commun). Les articles bruts sont effacés après 3 mois ; les éditions restent.
4. **Le site** est une page statique (sans build), installable comme une appli, qui lit Supabase avec la clé publique.
   Il est privé : il faut un compte membre (liste `veille_invites`), avec connexion par code e-mail.
   Les boutons Lu / Plus tard sont enregistrés dans Supabase, pour chaque compte.

## Inviter un ami

Donne-lui le code d'invitation (table `veille_codes`) : il crée son compte sur le site avec son e-mail et ce code,
puis devient membre automatiquement. Sans le bon code, Supabase refuse la création du compte.

- **Changer le code** : modifie la ligne de `veille_codes` (Table Editor). Les comptes déjà créés gardent leur accès.
- **Retirer quelqu'un** : supprime sa ligne de `veille_invites` ; il ne voit plus la veille, même connecté.
- **Ajouter quelqu'un sans code** : ajoute son e-mail en minuscules dans `veille_invites`.

| Fichier | Rôle |
| --- | --- |
| `index.html`, `styles.css`, `veille.js`, `config.js` | Le site |
| `medieval-street.js` | La scène Three.js de l'en-tête |
| `sources.json` | Les flux suivis, par thème (`bord` pour équilibrer la politique) |
| `collector/` | La collecte du matin (Node 22) |
| `supabase/schema.sql` | Les tables et les règles d'accès |
| `supabase/comptes.sql` | La liste d'invités, la veille privée et le Codex réservé à Gabin |
| `manifest.webmanifest`, `icons/` | L'installation comme une appli |
| `.github/workflows/collecte.yml` | La tâche planifiée |

## Mise en route

1. **Supabase** : exécute `supabase/schema.sql` puis `supabase/comptes.sql` dans le SQL Editor du projet du Codex,
   et active le hook Authentication > Hooks > « Before User Created » sur `public.veille_avant_inscription`.
2. **Clé Claude** : crée une clé API sur platform.claude.com, et fixe une limite de dépense mensuelle dans la console (Limits) par sécurité.
3. **Secrets GitHub** (Settings > Secrets and variables > Actions) :
   `ANTHROPIC_API_KEY`, `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
   (Supabase > Project settings > API keys, clé secrète `service_role`, à ne jamais mettre dans le site).
4. **Premier essai** : onglet Actions > « Collecte du matin » > Run workflow, case « Essai » cochée,
   pour lire le résultat dans le journal sans rien publier. Relance-le ensuite sans la case pour publier.

Le modèle par défaut est Claude Haiku 5.5 (environ 0,30 $ par mois ; le journal affiche le coût de chaque collecte). Pour en changer, crée la variable `VEILLE_MODEL`
(onglet Variables, à côté des secrets), par exemple `claude-sonnet-5-5` (environ 5 $ par mois) ou `claude-opus-5-5` (environ 10 $).

En local : `cd collector`, `npm install`, puis `node collect.mjs --sans-ia` pour tester les flux,
ou `node collect.mjs --essai` avec `ANTHROPIC_API_KEY` défini pour voir les résumés sans publier.
Pour voir le site, sers le dossier avec un serveur statique (par exemple Live Server).

## Mise en ligne sur veille.gabin-clavier.fr

Même hébergement que Codex et Liens : le repo est importé sur Vercel (preset « Other », aucune commande de build),
puis le domaine `veille.gabin-clavier.fr` est ajouté au projet Vercel.
Le CNAME indiqué par Vercel est créé dans la zone DNS `gabin-clavier.fr` sur Cloudflare, en « DNS only » (nuage gris).
Chaque push sur `main` redéploie le site ; `.vercelignore` écarte la collecte et le schéma.

## Droits et limites

- Le site n'affiche que le titre, la source, un résumé rédigé par l'IA et le lien vers l'article, jamais le texte complet.
- Les résumés partent du chapô des flux : pour les articles payants, ils restent forcément partiels.

## Pistes pour la suite

Score d'importance, recherche dans les archives, récap par e-mail ou notification,
sujets suivis dans le temps, et le volet finance à construire avec les sources d'un ami.
