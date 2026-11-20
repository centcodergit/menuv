import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FocusContext = createContext({
  focused: null,
  setFocused: () => {},
  enabled: false,
});

/**
 * Aceternity "Focus Cards", rebuilt: while one card is hovered (or holds keyboard focus), the others blur slightly,
 * dim and step back. Mouse only (no hover state on touch); `enabled={false}` turns it off (e.g. during a drag or
 * under reduced motion, where the dim stays but blur and scale go).
 */
export function FocusCards({ enabled = true, reduced = false, children }) {
  const [focused, setFocusedState] = useState(null);
  const setFocused = useCallback((i) => setFocusedState(i), []);
  const value = useMemo(
    () => ({ focused: enabled ? focused : null, setFocused, enabled, reduced }),
    [enabled, focused, setFocused, reduced],
  );
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function FocusCard({ index, as: Tag = "div", className, children, ...props }) {
  const { focused, setFocused, enabled, reduced } = useContext(FocusContext);
  const dimmed = enabled && focused !== null && focused !== index;
  const leave = () => setFocused(null);
  return (
    <Tag
      data-focus-dimmed={dimmed || undefined}
      onPointerEnter={(e) => enabled && e.pointerType === "mouse" && setFocused(index)}
      onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onFocus={(e) => enabled && e.target.matches(":focus-visible") && setFocused(index)}
      onBlur={leave}
      className={cn(
        "transition-[filter,opacity,transform] duration-500 ease-mv-out",
        dimmed && (reduced ? "opacity-60" : "scale-[0.98] opacity-60 blur-[2px]"),
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default FocusCards;
