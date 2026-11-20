import { useEffect, useMemo, useState } from "react";
import el from "@/i18n/el.json";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { loadArticles } from "@/content/articles";

const flatten = (node, prefix = "") =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );

const show = (value) => (Array.isArray(value) ? value.join("  ·  ") : String(value ?? "—"));

function Strings({ dict, lang }) {
  const rows = useMemo(() => {
    const current = new Map(flatten(dict));
    return flatten(el).map(([key, greek]) => [key, greek, current.get(key)]);
  }, [dict]);
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="font-mono text-label uppercase text-mv-muted">
        <tr>
          <th className="w-[22%] border-b border-mv-line py-2 pr-4">key ({rows.length})</th>
          <th className="w-[39%] border-b border-mv-line py-2 pr-4">el</th>
          <th className="border-b border-mv-line py-2">{lang}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([key, greek, value]) => (
          <tr key={key} className="align-top">
            <td className="border-b border-mv-line py-2 pr-4 font-mono text-xs text-mv-violet-300">{key}</td>
            <td className="border-b border-mv-line py-2 pr-4 text-mv-muted" lang="el">{show(greek)}</td>
            <td className="border-b border-mv-line py-2" lang={lang}>{show(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Article({ article, lang }) {
  return (
    <div lang={lang} className="space-y-3">
      <p className="font-mono text-label uppercase text-mv-violet-300">
        {article.category} · {article.readTime}′
      </p>
      <h3 className="font-display text-xl font-bold">{article.title}</h3>
      {article.body.map((b, i) =>
        b.type === "h3" ? (
          <h4 key={i} className="pt-2 font-display font-semibold text-mv-text">{b.text}</h4>
        ) : (
          <p key={i} className="text-sm leading-relaxed text-mv-muted">{b.text}</p>
        ),
      )}
    </div>
  );
}

function Articles({ lang }) {
  const [pair, setPair] = useState(null);
  useEffect(() => {
    let live = true;
    Promise.all([loadArticles("el"), loadArticles(lang)]).then(([greek, current]) => live && setPair({ greek, current }));
    return () => {
      live = false;
    };
  }, [lang]);
  if (!pair) return null;
  return pair.greek.map((greek, i) => (
    <div key={greek.slug} className="grid gap-8 border-b border-mv-line py-10 md:grid-cols-2">
      <Article article={greek} lang="el" />
      <Article article={pair.current[i]} lang={lang} />
    </div>
  ));
}

/**
 * DEVELOPMENT ONLY (/__copy): every dictionary string and every article in the active language next to
 * the Greek original, for reviewing translations. Not routed in production builds.
 */
export default function CopyReview() {
  const { lang, setLang, dict } = useI18n();
  const [tab, setTab] = useState("strings");
  const pill = (on) => (on ? "btn-primary !min-h-0 !py-1.5 text-sm" : "btn-outline !min-h-0 !py-1.5 text-sm");

  return (
    <section className="section !pt-32">
      <div className="container-mv">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {LANGUAGES.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={pill(l.code === lang)}>
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
          <span className="mx-2 h-6 w-px bg-mv-line" />
          <button type="button" onClick={() => setTab("strings")} className={pill(tab === "strings")}>UI strings</button>
          <button type="button" onClick={() => setTab("articles")} className={pill(tab === "articles")}>Articles</button>
        </div>
        {tab === "strings" ? <Strings dict={dict} lang={lang} /> : <Articles lang={lang} />}
      </div>
    </section>
  );
}
