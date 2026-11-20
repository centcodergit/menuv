import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** sonner restyled to obsidian glass: bottom-center on mobile, bottom-right on desktop (master prompt 6.8). */
const Toaster = (props) => {
  const { theme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sonner
      theme={theme}
      position={isDesktop ? "bottom-right" : "bottom-center"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast glass !rounded-inner !text-mv-text !font-sans !shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)]",
          description: "group-[.toast]:!text-mv-muted",
          actionButton: "group-[.toast]:!bg-mv-violet-600 group-[.toast]:!text-white",
          cancelButton: "group-[.toast]:!bg-mv-surface-2 group-[.toast]:!text-mv-muted",
          success: "[&_[data-icon]]:!text-mv-success",
          error: "[&_[data-icon]]:!text-mv-danger",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export default Toaster;
