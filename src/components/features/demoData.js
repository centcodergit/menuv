import { PHONE_MENU } from "@/content/phoneMenu";

/**
 * Data for the Features micro-demos (master prompt 7.2). Everything here belongs to the demo restaurant,
 * La Bella Italia (dishes and prices from src/content/phoneMenu.js). The analytics figures are illustrative
 * numbers for that demo menu only, never Menuverse results.
 */

const ALL_DISHES = Object.values(PHONE_MENU).flat();
export const dish = (id) => ALL_DISHES.find((d) => d.id === id);

/** Live updates: the row whose price changes (€8.50 ↔ €9.00). */
export const LIVE_DISH = "bruschetta";
export const LIVE_PRICES = [8.5, 9];

/** Multilingual: one dish name on a departures board. Data, not UI copy (same list in every language). */
export const FLAP_WORDS = ["Μουσακάς", "Moussaka", "Moussaká", "Musaca", "Mousaká", "Mussaka"];

/** Dietary filters: five dishes with their (demo) diet flags and allergens. */
export const DIET_DISHES = [
  { id: "bruschetta", vegan: true, glutenFree: false, allergens: ["gluten"] },
  { id: "caprese", vegan: false, glutenFree: true, allergens: ["milk"] },
  { id: "margherita", vegan: false, glutenFree: false, allergens: ["gluten", "milk"] },
  { id: "pesto", vegan: false, glutenFree: false, allergens: ["gluten", "milk", "nuts"] },
  { id: "panna-cotta", vegan: false, glutenFree: true, allergens: ["milk"] },
];
/** Chip states the dietary demo steps through (loop: all, once: 1 → 3, reduced motion: step 3). */
export const DIET_STEPS = [[], ["vegan"], ["glutenFree"], ["glutenFree", "allergens"], ["allergens"]];

/**
 * Analytics: two illustrative weeks for La Bella Italia. `hours` = relative views per hour, 12:00 to 24:00
 * (no y axis is shown), `total` = menu views, `dishes` = most viewed dishes. Kept deliberately modest.
 */
export const ANALYTICS = [
  {
    hours: [8, 18, 26, 20, 11, 8, 12, 21, 36, 48, 42, 25, 12],
    total: 1248,
    dishes: [
      ["margherita", 214],
      ["carbonara", 168],
      ["tiramisu", 97],
    ],
  },
  {
    hours: [10, 21, 29, 22, 12, 9, 14, 24, 40, 52, 45, 27, 13],
    total: 1312,
    dishes: [
      ["margherita", 226],
      ["carbonara", 181],
      ["tiramisu", 104],
    ],
  },
];
export const PEAK = { from: 8, to: 10, label: "20:00–22:00" };
