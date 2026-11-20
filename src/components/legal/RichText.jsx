import { Fragment } from "react";
import { TransitionLink } from "@/providers/PageTransition";

/** Cross-links inside the legal texts: email addresses and the other legal pages, by their names. */
const PAGE_LINKS = [
  { pattern: "Privacy Policy", to: "/privacypolicy" },
  { pattern: "Πολιτική Απορρήτου", to: "/privacypolicy" },
  { pattern: "Cookie Policy", to: "/cookiepolicy" },
  { pattern: "Terms of Service", to: "/termsofservice" },
];
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]*\w/;
const TOKEN = new RegExp(`(${EMAIL.source}|${PAGE_LINKS.map((l) => l.pattern).join("|")})`, "g");

const linkClass =
  "text-mv-violet-300 underline decoration-mv-violet-400/40 underline-offset-4 transition-colors hover:decoration-mv-violet-300";

/**
 * Renders a legal paragraph with mailto links and links to the other legal pages.
 * `currentPath` keeps a page from linking to itself.
 */
export default function RichText({ text, currentPath }) {
  return text.split(TOKEN).map((part, i) => {
    if (EMAIL.test(part) && part.match(EMAIL)[0] === part) {
      return (
        <a key={i} href={`mailto:${part}`} className={linkClass}>
          {part}
        </a>
      );
    }
    const page = PAGE_LINKS.find((l) => l.pattern === part);
    if (page && page.to !== currentPath) {
      return (
        <TransitionLink key={i} to={page.to} className={linkClass}>
          {part}
        </TransitionLink>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
