import { useT } from "@/lib/i18n";
import { openChat } from "@/lib/chatBus";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import InteractiveHoverButton from "@/components/fx/InteractiveHoverButton";
import ChatPreview from "@/components/support/ChatPreview";

/**
 * 7.4 Live support, "Έχετε Ερωτήσεις; Είμαστε Εδώ!": split layout. Left: header, paragraph, the
 * Interactive Hover Button (opens the real chat, master prompt 3.6) and the sign-in note.
 * Right: a decorative chat window where the greeting, a typing indicator and a reply appear one by one.
 */
export default function LiveSupport() {
  const t = useT();
  return (
    <Section bg="base" aria-labelledby="support-title">
      <div className="container-mv grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-6">
          <SectionHeader
            id="support"
            align="left"
            eyebrow={t("support.eyebrow")}
            title={t("support.title")}
            lead={t("support.body")}
            accentWords={2}
            titleId="support-title"
          >
            <div className="mt-10 flex flex-col items-start gap-4">
              <InteractiveHoverButton onClick={() => openChat()}>
                {t("support.cta")}
              </InteractiveHoverButton>
              <p className="font-mono text-label uppercase text-mv-muted">{t("support.note")}</p>
            </div>
          </SectionHeader>
        </div>
        <div className="relative lg:col-span-6">
          <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(50% 50% at 50% 50%, rgb(var(--mv-violet-600) / 0.35), transparent 70%)" }} />
          <ChatPreview className="mx-auto max-w-[460px]" />
        </div>
      </div>
    </Section>
  );
}
