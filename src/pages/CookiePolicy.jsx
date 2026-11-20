import LegalPage from "@/components/legal/LegalPage";
import cookies from "@/content/legal/cookies";

/**
 * /cookiepolicy. Ported from the old app (it existed there in English and Greek; the Privacy Policy links to it).
 * Greek visitors read the Greek text, everyone else the English.
 */
export default function CookiePolicy() {
  return <LegalPage doc={cookies} />;
}
