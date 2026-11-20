import { appParams } from "@/lib/app-params";

/**
 * The Base44 SDK (with axios + socket.io) is ~45 KB gzipped, so code that runs during the first
 * paint loads it lazily through this helper. Code inside lazy sections and pages can import
 * `{ base44 } from "@/api/base44Client"` directly, as usual.
 *
 * DEVELOPMENT ONLY: with localStorage "mv-mock-backend" = "1" (or ?mock=1 once), getBase44() returns an
 * in-memory mock (src/api/mockBase44.js) so auth, chat, forms and admin can be exercised before the app
 * is linked to Base44. Production builds never include the mock.
 */
const mockOn = () => {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("mock") === "1") localStorage.setItem("mv-mock-backend", "1");
    return localStorage.getItem("mv-mock-backend") === "1";
  } catch {
    return false;
  }
};

export const usingMockBackend = mockOn();
export const hasBackend = Boolean(appParams.appId) || usingMockBackend;

let clientPromise;
export function getBase44() {
  clientPromise ??= usingMockBackend
    ? import("@/api/mockBase44").then((m) => m.mockBase44)
    : import("@/api/base44Client").then((m) => m.base44);
  return clientPromise;
}
