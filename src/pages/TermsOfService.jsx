import LegalPage from "@/components/legal/LegalPage";
import terms from "@/content/legal/terms";

/** /termsofservice (master prompt 8.2). Text: Content Pack L2, English for every language. */
export default function TermsOfService() {
  return <LegalPage doc={terms} />;
}
