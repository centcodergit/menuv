import { getBase44, hasBackend } from "@/api/getBase44";

/** Same rule as base44/functions/subscribeNewsletter (kept loose on purpose: the server has the final say). */
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) && value.trim().length <= 254;

/**
 * Newsletter sign-up (master prompt 3.8) through the `subscribeNewsletter` backend function.
 * Resolves to "subscribed" or "duplicate"; throws on network/server errors.
 */
export async function subscribeNewsletter(email, language) {
  if (!hasBackend) throw new Error("No backend");
  const b = await getBase44();
  const res = await b.functions.invoke("subscribeNewsletter", { email: email.trim(), language, source: "homepage" });
  const status = (res?.data ?? res)?.status;
  if (status !== "subscribed" && status !== "duplicate") throw new Error("Unexpected response");
  return status;
}
