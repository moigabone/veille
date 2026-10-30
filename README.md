# Veille

Récap du jour de ma veille personnelle : un résumé global, puis les sujets par thème, sous la rue médiévale 3D de la taverne, dans le style « Codex Nuit ».
Page statique : `index.html`, `styles.css`, `veille.js` (affichage et boutons Lu / Plus tard), `data.js` (édition du jour) et `medieval-street.js` (scène Three.js), sans build ni dépendance à installer.

Pour publier une nouvelle édition, remplacer le contenu de `data.js`.
Les sujets lus et gardés sont retenus dans le navigateur (localStorage).

Pour la voir en local, sers le dossier avec n'importe quel serveur statique (par exemple Live Server).
Un serveur est nécessaire, car les modules JavaScript ne se chargent pas en ouvrant le fichier directement.

## Mise en ligne sur veille.gabin-clavier.fr

Même hébergement que Codex et Liens : le repo est importé sur Vercel (preset « Other », aucune commande de build),
puis le domaine `veille.gabin-clavier.fr` est ajouté au projet Vercel.
Le CNAME indiqué par Vercel est créé dans la zone DNS `gabin-clavier.fr` sur Cloudflare, en « DNS only » (nuage gris).
Chaque push sur `main` redéploie le site.
