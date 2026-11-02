// Collecte du matin : flux RSS → sujets regroupés et résumés par Claude → édition du jour dans Supabase.
// Variables : ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (VEILLE_MODEL en option).
// `node collect.mjs --essai` affiche le résultat sans rien écrire ; `--sans-ia` s'arrête après les flux.
import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const DRY_RUN = process.argv.includes("--essai");
const NO_AI = process.argv.includes("--sans-ia");
const MODEL = process.env.VEILLE_MODEL || "claude-haiku-5-5"; // ~0,30 $/mois ; Sonnet 5.5 ~5 $, Opus 5.5 ~10 $
// Prix en dollars par million de jetons (entrée, sortie), pour afficher le coût de chaque collecte
const PRICES = { "claude-haiku-5-5": [0.10, 0.50], "claude-sonnet-5-5": [2, 10], "claude-opus-5-5": [4, 20] };
const WINDOW_HOURS = 26;      // un peu plus qu'une journée, pour ne rien rater entre deux collectes
const MAX_PER_THEME = 60;     // articles envoyés à l'IA par thème, les plus récents d'abord
const THEMES = {
  tech: "Tech", cyber: "Cyber", ia: "IA", finance: "Finance",
  eco: "Économie", politique: "Politique", monde: "Monde",
};

const sources = JSON.parse(readFileSync(new URL("../sources.json", import.meta.url), "utf8"));

// --- Flux RSS / Atom ---

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", textNodeName: "#text" });
const list = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
const text = v => (typeof v === "object" && v !== null ? v["#text"] ?? "" : v ?? "").toString();
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", hellip: "…", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç" };
const clean = s => text(s)
  .replace(/<[^>]*>/g, " ")
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#"
    ? String.fromCodePoint(parseInt(e.slice(e[1] === "x" ? 2 : 1), e[1] === "x" ? 16 : 10))
    : ENTITIES[e.toLowerCase()] ?? m)
  .replace(/\s+/g, " ")
  .trim();
const link = item => {
  if (typeof item.link === "string") return item.link;
  const links = list(item.link);
  const alt = links.find(l => !l["@rel"] || l["@rel"] === "alternate") ?? links[0];
  return alt?.["@href"] ?? text(alt) ?? item.guid?.["#text"] ?? "";
};

async function readFeed(src) {
  const res = await fetch(src.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; veille.gabin-clavier.fr)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const doc = xml.parse(await res.text());
  const items = list(doc.rss?.channel?.item ?? doc.feed?.entry ?? doc["rdf:RDF"]?.item);
  return items.map(item => {
    const date = item.pubDate ?? item.published ?? item.updated ?? item["dc:date"];
    return {
      url: link(item).trim(),
      theme: src.theme,
      source: src.name,
      bord: src.bord ?? null,
      title: clean(item.title),
      snippet: clean(item.description ?? item.summary ?? item.content ?? "").slice(0, 400),
      published_at: date ? new Date(text(date)).toISOString() : null,
    };
  }).filter(a => a.url.startsWith("http") && a.title);
}

async function collect() {
  const since = Date.now() - WINDOW_HOURS * 3600e3;
  const seenUrl = new Set(), seenTitle = new Set(), articles = [], failures = [];
  const results = await Promise.allSettled(sources.map(readFeed));
  results.forEach((r, i) => {
    if (r.status === "rejected") return failures.push(`${sources[i].name} (${r.reason.message})`);
    for (const a of r.value) {
      const key = a.theme + a.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
      if (a.published_at && Date.parse(a.published_at) < since) continue;
      if (seenUrl.has(a.url) || seenTitle.has(key)) continue;
      seenUrl.add(a.url);
      seenTitle.add(key);
      articles.push(a);
    }
  });
  if (failures.length) console.warn("Flux en échec :", failures.join(", "));
  return articles;
}

// --- Résumés par Claude ---

const anthropic = NO_AI ? null : new Anthropic();
// En cas de refus du modèle, l'API relance sur un autre modèle (pas proposé pour Haiku)
const FALLBACK = MODEL.includes("haiku") ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };
const usage = { input: 0, output: 0 };
const track = r => { usage.input += r.usage.input_tokens; usage.output += r.usage.output_tokens; };
const checkStop = r => {
  if (r.stop_reason === "refusal") throw new Error(`Refus du modèle (${r.stop_details?.category ?? "sans catégorie"})`);
  if (r.stop_reason === "max_tokens") throw new Error("Réponse coupée (max_tokens)");
};

const TopicsSchema = z.object({
  topics: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    items: z.array(z.number().int()),
    note: z.string().nullable(),
  })),
});

const SYSTEM = `Tu rédiges la veille quotidienne de Gabin, en français.
On te donne les articles parus depuis hier sur un thème, chacun avec un numéro, sa source, son titre et son chapô.

Ta tâche :
- Regroupe les articles qui parlent du même événement ou du même sujet : un sujet couvert par dix médias ne compte qu'une fois.
- Garde les 3 à 5 sujets les plus importants du thème, du plus important au moins important. Un sujet repris par plusieurs sources, ou qui a des conséquences concrètes, compte plus qu'une annonce mineure. Écarte les promotions, bons plans, tests de produits et contenus sponsorisés.
- Pour chaque sujet : un titre factuel en français (90 caractères au plus), puis un résumé de deux phrases qui dit ce qui s'est passé et pourquoi ça compte.
- Appuie-toi uniquement sur les titres et chapôs fournis. N'invente aucun chiffre ni aucun fait ; si l'information est partielle, reste prudent dans la formulation.
- Ne recopie pas les phrases des articles : reformule avec tes mots.
- Dans "items", liste les numéros de tous les articles du sujet, le plus complet d'abord.
- "note" vaut presque toujours null. En politique, si un sujet n'est couvert que par des sources d'un même bord, écris-le (par exemple : « Couvert seulement par la presse de droite »). Ne signale pas qu'un sujet n'a qu'une source : le lecteur voit déjà les sources.
- Si on te donne des sujets déjà traités dans d'autres thèmes, ne les reprends pas, même sous un autre angle : choisis d'autres sujets.
- Les sources anglophones doivent aussi être résumées en français.`;

async function summarizeTheme(theme, items, done) {
  const lines = items.map((a, i) =>
    `[${i}] ${a.source}${a.bord ? ` (${a.bord})` : ""} — ${a.title}${a.snippet ? `\n    ${a.snippet}` : ""}`);
  const already = done.length ? `Sujets déjà traités dans d'autres thèmes :\n${done.map(t => `- ${t.title}`).join("\n")}\n\n` : "";
  const res = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system: SYSTEM,
    output_config: { effort: "medium", format: betaZodOutputFormat(TopicsSchema) },
    messages: [{ role: "user", content: `${already}Thème : ${THEMES[theme]}\n\n${lines.join("\n")}` }],
  });
  track(res);
  checkStop(res);
  if (!res.parsed_output) throw new Error("Réponse illisible");
  return res.parsed_output.topics.map((t, rank) => ({
    theme,
    rank,
    title: t.title,
    summary: t.summary,
    note: t.note || null,
    sources: firstPerSource([...new Set(t.items)].filter(i => items[i]).map(i => items[i]))
      .map(a => ({ name: a.source, title: a.title, url: a.url })),
  })).filter(t => t.sources.length);
}

// Un seul article par média dans un sujet, le premier cité par l'IA
const firstPerSource = list => list.filter((a, i) => list.findIndex(b => b.source === a.source) === i);

async function writeDigest(topics) {
  const lines = topics.map(t => `- [${THEMES[t.theme]}] ${t.title} : ${t.summary}`);
  const res = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "medium" },
    system: "Tu rédiges le chapeau de la veille quotidienne de Gabin, en français. Écris un seul paragraphe de trois ou quatre phrases qui résume ce qui domine la journée, en commençant par le plus important et en passant d'un thème à l'autre. Pas de titre, pas de liste, pas de formule d'introduction : seulement le paragraphe. N'ajoute aucun fait absent des sujets fournis.",
    messages: [{ role: "user", content: `Sujets du jour :\n${lines.join("\n")}` }],
  });
  track(res);
  checkStop(res);
  return res.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
}

// --- Enregistrement ---

const parisDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());

async function save(db, articles, topics, digest) {
  const { error: artErr } = await db.from("veille_articles")
    .upsert(articles.map(({ bord, ...a }) => a), { onConflict: "url", ignoreDuplicates: true });
  if (artErr) throw artErr;

  const date = parisDate();
  const themeCounts = {};
  for (const a of articles) themeCounts[a.theme] = (themeCounts[a.theme] ?? 0) + 1;
  // Relancer la collecte le même jour remplace l'édition (et ses sujets)
  await db.from("veille_editions").delete().eq("edition_date", date);
  const { data: edition, error: edErr } = await db.from("veille_editions").insert({
    edition_date: date,
    digest,
    article_count: articles.length,
    source_count: new Set(articles.map(a => a.source)).size,
    theme_counts: themeCounts,
  }).select("id").single();
  if (edErr) throw edErr;

  const { error: topErr } = await db.from("veille_topics").insert(topics.map(t => ({ ...t, edition_id: edition.id })));
  if (topErr) throw topErr;
  return date;
}

// --- Programme ---

const articles = await collect();
const byTheme = Object.keys(THEMES).map(theme => [theme, articles
  .filter(a => a.theme === theme)
  .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
  .slice(0, MAX_PER_THEME)]);
console.log(`${articles.length} articles depuis ${WINDOW_HOURS} h :`, byTheme.map(([t, l]) => `${t} ${l.length}`).join(", "));
if (NO_AI) process.exit(0);

// Les thèmes spécialisés passent d'abord, pour qu'un sujet atterrisse dans le plus précis (un piratage en Cyber
// plutôt qu'en Tech ou Monde) ; les suivants reçoivent la liste des sujets déjà pris pour ne pas les répéter.
const ORDER = ["cyber", "ia", "finance", "politique", "eco", "monde", "tech"];
const topics = [];
for (const [theme, items] of [...byTheme].sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))) {
  if (!items.length) continue;
  try {
    topics.push(...await summarizeTheme(theme, items, topics));
  } catch (err) {
    console.error(`Thème ${theme} ignoré :`, err.message); // un thème en échec n'empêche pas l'édition
  }
}
if (!topics.length) throw new Error("Aucun sujet produit, édition non publiée");
const digest = await writeDigest(topics);
const price = PRICES[MODEL];
const cost = price ? ` · environ ${((usage.input * price[0] + usage.output * price[1]) / 1e6).toFixed(4)} $` : "";
console.log(`Modèle ${MODEL} · ${usage.input} jetons en entrée, ${usage.output} en sortie${cost}`);

if (DRY_RUN) {
  console.log(`\n${digest}\n`);
  for (const t of topics) console.log(`[${t.theme} ${t.rank + 1}] ${t.title}\n  ${t.summary}${t.note ? `\n  (${t.note})` : ""}\n  ${t.sources.map(s => s.name).join(", ")}`);
} else {
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  console.log("Édition publiée :", await save(db, articles, topics, digest));
}
