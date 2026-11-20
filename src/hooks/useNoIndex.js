import { useEffect } from "react";

/**
 * Keeps search engines from indexing the current page (404, account pages): sets <meta name="robots"> to
 * "noindex, nofollow" while mounted and restores the site default afterwards.
 */
export function useNoIndex() {
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]');
    const created = !tag;
    if (created) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "robots");
      document.head.appendChild(tag);
    }
    const previous = tag.getAttribute("content");
    tag.setAttribute("content", "noindex, nofollow");
    return () => {
      if (created) tag.remove();
      else tag.setAttribute("content", previous ?? "index, follow");
    };
  }, []);
}
