// Édition du jour : remplacée à chaque nouvelle veille.
// Un sujet = [titre, résumé, sources]
export const edition = {
  date: "Vendredi 30 octobre 2026",
  digest: "La matinée est dominée par une faille critique dans plusieurs VPN d’entreprise, exploitée depuis lundi. La BCE devrait laisser ses taux inchangés jeudi, l’inflation de la zone euro étant revenue à 2,1 %. Côté IA, un modèle ouvert rejoint les meilleurs modèles fermés sur le code. À Paris, le Sénat entame l’examen du budget 2027.",
  stats: "142 articles · 38 sources · édition de 6 h 40",
  themes: [
    { id: "tech", name: "Tech", glyph: "T", articles: 24, topics: [
      ["Les premières puces gravées en 2 nm sortent des chaînes", "Le fondeur taïwanais confirme la production en volume. Les premiers téléphones équipés arrivent au printemps, avec un gain d’autonomie annoncé autour de 25 %.", ["Les Échos", "Numerama", "The Verge", "Ars Technica"]],
      ["Batterie remplaçable : Bruxelles fixe le calendrier", "Les téléphones vendus dans l’Union devront permettre de changer la batterie sans outil spécial à partir de février 2027. Les constructeurs demandent un délai.", ["Le Monde", "Frandroid", "Euractiv"]],
      ["Le marché des casques de réalité mixte recule encore", "Deuxième année de baisse : les ventes chutent de 18 % sur un an. Les fabricants misent désormais sur des lunettes plus légères.", ["01net", "The Verge"]],
      ["Une fondation reprend une bibliothèque open source orpheline", "Utilisée par des millions de projets, elle n’avait plus de mainteneur depuis un an. Trois entreprises financent désormais deux postes à temps plein.", ["LWN", "Next", "Hacker News"]]
    ]},
    { id: "cyber", name: "Cyber", glyph: "C", articles: 17, topics: [
      ["Faille critique dans plusieurs VPN d’entreprise", "Exploitée depuis lundi, elle permet d’entrer sur le réseau sans identifiants. Un correctif existe ; l’ANSSI recommande de l’appliquer sans attendre et de vérifier les journaux.", ["CERT-FR", "Zataz", "BleepingComputer", "LeMagIT", "The Record"]],
      ["Un hôpital du Grand Est paralysé par un rançongiciel", "Les urgences fonctionnent en mode dégradé depuis mercredi. Les données de patients auraient été copiées ; une plainte a été déposée.", ["France 3", "Zataz", "Le Parisien"]],
      ["L’ANSSI publie son panorama de la menace", "L’hameçonnage ciblé reste la première porte d’entrée. Les attaques contre les collectivités ont doublé en deux ans.", ["ANSSI", "LeMagIT"]]
    ]},
    { id: "ia", name: "IA", glyph: "IA", articles: 29, topics: [
      ["Un modèle ouvert rattrape les meilleurs modèles fermés sur le code", "Publié sous licence permissive, il égale les références du marché sur les tests de programmation. Il reste en retrait sur le raisonnement long.", ["Hugging Face", "The Decoder", "Le Monde Informatique"]],
      ["AI Act : les entreprises se préparent aux premiers contrôles", "Les obligations sur les systèmes à haut risque approchent. Beaucoup de PME découvrent qu’elles sont concernées par leurs outils de recrutement.", ["Euractiv", "Les Échos", "L’Usine Digitale"]],
      ["Les centres de données font grimper la demande d’électricité", "En Irlande, ils consomment déjà plus d’un cinquième du réseau. RTE revoit ses prévisions françaises à la hausse pour 2030.", ["Le Monde", "Reuters", "RTE"]],
      ["Agents autonomes : des premiers bilans mitigés en entreprise", "Gains réels sur les tâches répétitives, mais beaucoup de reprises manuelles. Les équipes réclament de meilleurs outils de supervision.", ["MIT Tech Review", "Usbek & Rica"]]
    ]},
    { id: "finance", name: "Finance", glyph: "F", articles: 21, topics: [
      ["La BCE devrait maintenir ses taux jeudi", "Les marchés anticipent un statu quo. L’attention se porte sur le ton de la conférence de presse et sur une éventuelle baisse en décembre.", ["Les Échos", "Reuters", "Bloomberg"]],
      ["Le CAC 40 finit la semaine en hausse de 1,8 %", "Le luxe et les banques tirent l’indice. Les résultats trimestriels sont meilleurs que prévu pour deux tiers des entreprises.", ["Boursorama", "Investir"]],
      ["Les ETF crypto vivent leur pire semaine depuis mars", "Plus de 2 milliards de dollars de retraits. Les analystes y voient surtout des prises de bénéfices après l’été.", ["CoinDesk", "Les Échos", "Cointribune"]]
    ]},
    { id: "eco", name: "Économie", glyph: "É", articles: 16, topics: [
      ["Inflation en zone euro : 2,1 % en octobre", "L’estimation rapide confirme le ralentissement. Les services restent le principal moteur de la hausse des prix.", ["Eurostat", "La Tribune", "Le Monde"]],
      ["Le chômage remonte légèrement en France", "Le taux passe à 7,6 % au troisième trimestre. Les jeunes et l’intérim sont les plus touchés.", ["Insee", "Alternatives Économiques"]],
      ["Fret maritime : les tarifs remontent avant les fêtes", "Le prix d’un conteneur Asie–Europe grimpe de 30 % en un mois. Les distributeurs avancent leurs commandes.", ["Journal de la Marine marchande", "Les Échos"]]
    ]},
    { id: "politique", name: "Politique", glyph: "P", articles: 19, topics: [
      ["Budget 2027 : le Sénat entame l’examen des recettes", "Les sénateurs veulent revenir sur plusieurs hausses d’impôts votées à l’Assemblée. Le gouvernement n’exclut pas un nouveau recours au 49.3.", ["Public Sénat", "Le Figaro", "Libération", "Contexte"]],
      ["Assurance chômage : appel à la mobilisation le 12 novembre", "L’intersyndicale conteste le durcissement des règles d’indemnisation. Le patronat reste divisé sur le calendrier.", ["Le Monde", "L’Humanité", "Les Échos"]],
      ["Décentralisation : le projet de loi arrive au Conseil des ministres", "Il prévoit de nouvelles compétences pour les régions en matière de logement et de transports. Les maires réclament des garanties de financement.", ["Acteurs publics", "La Gazette des communes"]]
    ]},
    { id: "monde", name: "Monde", glyph: "M", articles: 16, topics: [
      ["États-Unis : dernière ligne droite avant les élections de mi-mandat", "Le scrutin de mardi décidera du contrôle du Congrès. Une vingtaine de sièges restent indécis selon les sondages.", ["AFP", "Le Monde", "Courrier international", "NPR"]],
      ["COP31 : le financement bloque à dix jours de l’ouverture", "Les pays du Sud réclament un calendrier précis pour les fonds promis. L’Union européenne arrive divisée sur la sortie des énergies fossiles.", ["Reporterre", "Le Monde", "Carbon Brief"]],
      ["Soudan : l’ONU alerte sur la famine au Darfour", "Plus de deux millions de personnes sont en situation critique. L’accès humanitaire reste quasi impossible dans le nord de la région.", ["ONU Info", "RFI", "Al Jazeera"]]
    ]}
  ]
};
