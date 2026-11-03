-- Lance la collecte chaque matin à l'heure : GitHub retarde souvent ses tâches planifiées de plusieurs heures.
-- Supabase (pg_cron) appelle l'API GitHub à 5 h 30 UTC (6 h 30 à Paris l'hiver) pour démarrer « Collecte du matin ».
-- À exécuter une fois dans Supabase > SQL Editor, après avoir remplacé COLLE_TON_JETON_ICI par le jeton GitHub.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Le jeton GitHub reste chiffré dans le coffre de Supabase (Vault)
select vault.create_secret('COLLE_TON_JETON_ICI', 'veille_github_token');

select cron.schedule('veille-collecte', '30 5 * * *', $$
  select net.http_post(
    url := 'https://api.github.com/repos/moigabone/veille/actions/workflows/collecte.yml/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'veille_github_token'),
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'veille-supabase'
    ),
    body := '{"ref": "main", "inputs": {"essai": false}}'::jsonb
  );
$$);

-- Pour vérifier les derniers lancements : select * from cron.job_run_details order by start_time desc limit 5;
-- Réponse de GitHub (204 = collecte lancée) : select status_code, content from net._http_response order by created desc limit 5;
