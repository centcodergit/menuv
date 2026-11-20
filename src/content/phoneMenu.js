/**
 * La Bella Italia: the demo restaurant inside the hero phone (master prompt 7.1) and section 7.7.
 * Dishes and prices come from the old site's hero mockup (menuverse.zip, Hero.jsx), which answers the
 * spec's [CONFIRM] note. Dish names stay Italian in every language; tab labels, tagline and the
 * "Traditional recipe" line are translated (phone.* keys), as a quiet multilingual touch.
 * Prices are EUR numbers so NumberFlow can roll them and Intl can format them per locale.
 */
export const PHONE_TABS = ["starters", "pizza", "pasta", "desserts"];

export const PHONE_MENU = {
  starters: [
    { id: "bruschetta", emoji: "🍅", name: "Bruschetta", price: 8.5 },
    { id: "caprese", emoji: "🥗", name: "Caprese Salad", price: 10 },
    { id: "arancini", emoji: "🧆", name: "Arancini", price: 9 },
  ],
  pizza: [
    { id: "margherita", emoji: "🍕", name: "Margherita", price: 12 },
    { id: "quattro-formaggi", emoji: "🧀", name: "Quattro Formaggi", price: 14.5 },
    { id: "diavola", emoji: "🌶️", name: "Diavola", price: 13.5 },
  ],
  pasta: [
    { id: "carbonara", emoji: "🍝", name: "Carbonara", price: 13 },
    { id: "amatriciana", emoji: "🍝", name: "Amatriciana", price: 12.5 },
    { id: "pesto", emoji: "🌿", name: "Pesto Genovese", price: 11.5 },
  ],
  desserts: [
    { id: "tiramisu", emoji: "🍰", name: "Tiramisu", price: 7.5 },
    { id: "panna-cotta", emoji: "🍮", name: "Panna Cotta", price: 6.5 },
    { id: "gelato", emoji: "🍨", name: "Gelato", price: 5 },
  ],
};

export const PHONE_STATUS_TIME = "9:41";
export const PHONE_LOGO = "🍕";
