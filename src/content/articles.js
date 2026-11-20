/**
 * Articles (master prompt 3.9 / 7.13). Six guides, one text file per language in ./articles/{code}.js
 * (EL + EN verbatim from the Content Pack, the other six translated). Only the active language is loaded.
 *
 * Each article: slug, category, title, excerpt (= the intro paragraph), readTime (minutes),
 * body = [intro paragraph, then h3 + paragraph pairs], cover (generated, no stock images).
 * The URL hash #article-{slug} opens the reader, so articles are shareable.
 */

/** Shared, language-independent data, in display order. */
export const ARTICLE_META = [
  { slug: "ti-einai-to-psifiako-menou-qr", readTime: 4, cover: { hue: 262, seed: 11, angle: 145 } },
  { slug: "ilektroniko-menou-empeiria-pelati", readTime: 5, cover: { hue: 280, seed: 23, angle: 200 } },
  { slug: "psifiako-menou-estiatoria-ellada", readTime: 4, cover: { hue: 245, seed: 37, angle: 120 } },
  { slug: "psifiakos-katalogos-taseis", readTime: 4, cover: { hue: 295, seed: 41, angle: 160 } },
  { slug: "psifiako-menou-kafe-bar-taverna-fine-dining", readTime: 5, cover: { hue: 270, seed: 53, angle: 230 } },
  { slug: "pos-leitourgei-i-menuverse", readTime: 3, cover: { hue: 255, seed: 67, angle: 100 } },
];

export const ARTICLE_SLUGS = ARTICLE_META.map((a) => a.slug);

const loaders = import.meta.glob("./articles/*.js", { import: "default" });
const cache = {};

/** Loads the articles for `lang` (falls back to English, then Greek) merged with the shared meta. */
export async function loadArticles(lang) {
  if (cache[lang]) return cache[lang];
  const load = loaders[`./articles/${lang}.js`] ?? loaders["./articles/en.js"] ?? loaders["./articles/el.js"];
  const texts = await load();
  const bySlug = Object.fromEntries(texts.map((t) => [t.slug, t]));
  cache[lang] = ARTICLE_META.map((meta) => {
    const text = bySlug[meta.slug];
    return { ...meta, ...text, excerpt: text.body[0]?.text ?? "" };
  });
  return cache[lang];
}

export const articleHash = (slug) => `#article-${slug}`;

/** The slug in a "#article-{slug}" hash, if it is a known article. */
export function slugFromHash(hash) {
  const m = /^#article-(.+)$/.exec(hash ?? "");
  const slug = m ? decodeURIComponent(m[1]) : null;
  return slug && ARTICLE_SLUGS.includes(slug) ? slug : null;
}
