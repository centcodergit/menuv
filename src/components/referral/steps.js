/** The referral steps (dictionary keys `referral.step1..4`) and the stage the choreography reports when it is done. */
export const STEP_KEYS = ["step1", "step2", "step3", "step4"];
export const STAGE_DONE = 5;

/**
 * Splits a translated string around its first "50" so the number can roll with <Counter>:
 * "Οι Φίλοι σας Παίρνουν 50% Έκπτωση" → ["Οι Φίλοι σας Παίρνουν ", "% Έκπτωση"]. Works for "50%", "50 %", "-50 %".
 * Returns null when a translation has no "50" (the caller then renders the plain string).
 */
export function splitFifty(text) {
  const i = text.indexOf("50");
  return i < 0 ? null : [text.slice(0, i), text.slice(i + 2)];
}

/** "50%" written the way the language writes it in step 3 ("50 %" in de/fr), for the beam tokens and badges. */
export function percentLabel(text) {
  const match = text.match(/-?50\s?%/); // \s covers the no-break spaces de/fr use before %
  return match ? match[0] : "50%";
}

/** The pieces a label can wrap between (it breaks at spaces and after hyphens): "GRATIS-SPEISEKARTE" → ["GRATIS-", "SPEISEKARTE"]. */
export function unbreakableRuns(text) {
  return text.split(/\s+|(?<=-)/).filter(Boolean);
}

/** Length in letters of the longest unbreakable run (a first guess for the ticket text size before measuring). */
export function longestRun(text) {
  return Math.max(1, ...unbreakableRuns(text).map((w) => w.length));
}
