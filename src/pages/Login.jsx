import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageBackground } from "@/hooks/useBackgroundIntensity";
import { useNoIndex } from "@/hooks/useNoIndex";
import AuthCard from "@/components/login/AuthCard";
import LoginShowcase from "@/components/login/LoginShowcase";
import { readLoginParams } from "@/components/login/redirect";

/**
 * /login (master prompt 8.1, auth 3.4, plan parameters 3.5). Split screen from 1024px: the brand panel (deeper
 * violet mesh gradient, floating phone, logo, hero line) on the left, the obsidian auth card on the right.
 * Phones and tablets: the card alone. Honours ?redirect= (chat | same-site path) and ?plan=&billing=&currency=.
 */
export default function Login() {
  const { t } = useI18n();
  const { search } = useLocation();
  const params = useMemo(() => readLoginParams(search), [search]);
  const split = useMediaQuery("(min-width: 1024px)");
  usePageBackground("dim");
  useNoIndex();

  useEffect(() => {
    const previous = document.title;
    document.title = `${t("nav.login")} | Menuverse`;
    return () => {
      document.title = previous;
    };
  }, [t]);

  return (
    <section className="relative overflow-x-clip pb-10 pt-24 lg:pb-8 lg:pt-[6.5rem]">
      <div className="mx-auto grid w-full max-w-content grid-cols-1 items-start gap-6 px-4 sm:px-gutter lg:grid-cols-2 xl:gap-12">
        {split && (
          <div className="sticky top-[6.5rem] h-[calc(100svh-8.5rem)] min-h-[600px]">
            <LoginShowcase />
          </div>
        )}
        <div className="flex items-center justify-center lg:min-h-[calc(100svh-8.5rem)]">
          <AuthCard params={params} className="w-full max-w-[30rem]" />
        </div>
      </div>
    </section>
  );
}
