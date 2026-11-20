/**
 * Real client menus (master prompt 3.11 / 7.7). One today; the carousel arrows and dots appear
 * automatically from two items up. `image` is the owner-uploaded photo (placeholder until uploaded).
 * Add a client: append an object; translations are not needed (names are proper nouns).
 * `preview` (optional): what the phone shows, when it differs from the client's own menu (`url` stays the
 * "Δείτε το Μενού" link).
 */
export const SHOWCASE = [
  {
    id: "anima",
    name: "Athens Anima Bistro",
    url: "https://animabistro.base44.app",
    preview: { url: "https://menuverse-demo.base44.app", name: "Menuverse Demo" },
    image: null, // TODO(asset): Athens Anima Bistro photo from Nikolas (AVIF/WebP, explicit width/height)
    order: 1,
  },
];
