import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight accessible dropdown menu for the navbar (language, account). Replaces Radix DropdownMenu
 * there to keep @floating-ui and friends (~30 KB gzipped) out of the first load.
 * WAI-ARIA menu button pattern: Enter/Space/ArrowDown open; arrows, Home/End and type-ahead move;
 * Escape closes and returns focus; Tab or a click outside closes. The panel opens below, aligned right.
 */
const MenuContext = createContext(null);

/** Visible label of a menu item for type-ahead: skips decorative parts (flags, icons) marked aria-hidden. */
function typeaheadText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
  return clone.textContent.trim().toLowerCase();
}

export function Menu({ children, onOpenChange, className }) {
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();

  const setOpen = useCallback(
    (next) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const close = useCallback(
    (focusTrigger = true) => {
      setOpen(false);
      if (focusTrigger) triggerRef.current?.focus();
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  return (
    <MenuContext.Provider value={{ open, setOpen, close, triggerRef, panelRef, id }}>
      <div className={cn("relative", className)}>{children}</div>
    </MenuContext.Provider>
  );
}

const items = (panel) => [...(panel?.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])];

export function MenuTrigger({ children, className, ...props }) {
  const { open, setOpen, triggerRef, panelRef, id } = useContext(MenuContext);
  const focusItem = (which) =>
    requestAnimationFrame(() => {
      const list = items(panelRef.current);
      const checked = list.find((el) => el.getAttribute("aria-checked") === "true");
      (which === "last" ? list.at(-1) : which === "checked" ? (checked ?? list[0]) : list[0])?.focus();
    });
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${id}-menu`}
      data-state={open ? "open" : "closed"}
      onClick={() => {
        const next = !open;
        setOpen(next);
        if (next) focusItem("checked");
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true);
          focusItem(e.key === "ArrowUp" ? "last" : "checked");
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function MenuContent({ children, className, ...props }) {
  const { open, close, panelRef, id } = useContext(MenuContext);
  if (!open) return null;

  const onKeyDown = (e) => {
    const list = items(panelRef.current);
    const i = list.indexOf(document.activeElement);
    if (e.key === "ArrowDown") list[(i + 1) % list.length]?.focus();
    else if (e.key === "ArrowUp") list[(i - 1 + list.length) % list.length]?.focus();
    else if (e.key === "Home") list[0]?.focus();
    else if (e.key === "End") list.at(-1)?.focus();
    else if (e.key === "Escape") close(true);
    else if (e.key === "Tab") close(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const next = [...list.slice(i + 1), ...list.slice(0, i + 1)].find((el) => typeaheadText(el).startsWith(k));
      next?.focus();
    } else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  return (
    <div
      ref={panelRef}
      id={`${id}-menu`}
      role="menu"
      onKeyDown={onKeyDown}
      className={cn(
        "glass absolute right-0 top-full z-chat mt-2.5 origin-top-right rounded-inner p-1.5 animate-in fade-in zoom-in-[0.97] slide-in-from-top-1 duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const itemClass =
  "flex min-h-[44px] w-full cursor-pointer select-none items-center gap-3 rounded-[10px] px-3 text-left text-sm text-mv-text outline-none hover:bg-mv-violet-500/15 focus-visible:bg-mv-violet-500/15";

export function MenuItem({ children, onSelect, className, checked, index = 0, ...props }) {
  const { close } = useContext(MenuContext);
  const radio = typeof checked === "boolean";
  return (
    <button
      type="button"
      role={radio ? "menuitemradio" : "menuitem"}
      aria-checked={radio ? checked : undefined}
      tabIndex={-1}
      onClick={() => {
        onSelect?.();
        close(true);
      }}
      className={cn(itemClass, "fill-mode-both animate-in fade-in slide-in-from-top-1 duration-300", className)}
      style={{ animationDelay: `${index * 28}ms` }}
      {...props}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-mv-line" />;
}
