import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Motion Primitives "Morphing Dialog", rebuilt on Radix Dialog for the accessibility parts (focus trap, Escape,
 * outside click, aria-hidden siblings, scroll lock) and framer-motion shared layout for the morph: the trigger and
 * the panel carry the same `layoutId`, so the trigger grows into the panel and shrinks back on close.
 * Sub-elements (cover, title, pill) can share their own layoutIds for a richer morph.
 *
 * Wrap trigger and dialog in <MorphingDialogProvider> so both sides use the same spring.
 * Reduced motion: no layoutId (no morph), the panel fades. fullScreen: square corners, fills the viewport.
 * Put a <MorphingDialogTitle> inside: Radix labels the dialog with it (aria-labelledby).
 * No Radix Trigger is used: the caller restores focus in onCloseAutoFocus.
 */
export const MORPH_TRANSITION = {
  type: "spring",
  bounce: 0.08,
  duration: 0.55,
};

export function MorphingDialogProvider({ children, transition = MORPH_TRANSITION }) {
  return <MotionConfig transition={transition}>{children}</MotionConfig>;
}

const MorphingDialog = forwardRef(function MorphingDialog(
  {
    open,
    onOpenChange,
    layoutId,
    reduced = false,
    fullScreen = false,
    onOpenAutoFocus,
    onCloseAutoFocus,
    className,
    overlayClassName,
    children,
    ...props
  },
  ref,
) {
  const fade = { duration: reduced ? 0.2 : 0.4, ease: [0.16, 1, 0.3, 1] };
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount key="mv-morphing-dialog">
            <DialogPrimitive.Overlay forceMount asChild>
              <motion.div
                className={cn("fixed inset-0 z-[80] bg-mv-void/70 backdrop-blur-[3px]", overlayClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              />
            </DialogPrimitive.Overlay>
            <div
              className={cn("pointer-events-none fixed inset-0 z-[81] flex items-center justify-center", !fullScreen && "p-6")}
            >
              <DialogPrimitive.Content
                forceMount
                asChild
                aria-modal="true"
                aria-describedby={undefined}
                onOpenAutoFocus={onOpenAutoFocus}
                onCloseAutoFocus={onCloseAutoFocus}
              >
                <motion.div
                  ref={ref}
                  layoutId={reduced ? undefined : layoutId}
                  initial={reduced ? { opacity: 0 } : undefined}
                  animate={reduced ? { opacity: 1 } : undefined}
                  exit={reduced ? { opacity: 0 } : undefined}
                  transition={reduced ? fade : undefined}
                  style={{ borderRadius: fullScreen ? 0 : 28 }}
                  className={cn(
                    "pointer-events-auto relative flex flex-col overflow-hidden border border-mv-line-strong bg-mv-surface text-mv-text shadow-[0_40px_120px_-30px_rgba(0,0,0,0.75)] outline-none",
                    fullScreen ? "h-[100dvh] w-screen border-0" : "h-[min(90svh,1000px)] w-[min(880px,100%)]",
                    className,
                  )}
                  {...props}
                >
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
});

export const MorphingDialogTitle = DialogPrimitive.Title;
export const MorphingDialogClose = DialogPrimitive.Close;

export default MorphingDialog;
