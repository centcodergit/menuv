import LegalPage from "@/components/legal/LegalPage";
import privacy from "@/content/legal/privacy";

/** /privacypolicy (master prompt 8.2). Text: Content Pack L1, English for every language. */
export default function PrivacyPolicy() {
  return <LegalPage doc={privacy} />;
}
