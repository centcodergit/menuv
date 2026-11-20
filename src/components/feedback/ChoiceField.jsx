import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import FieldShell, { FieldError, LabelText } from "@/components/feedback/FieldShell";

/**
 * Wrapper for the radiogroups (stars, yes/no): the label sits above as a plain label (a label in a notch of the
 * border read oddly next to a control with its own outline). `framed` draws one outlined box like the text fields
 * (stars); without it the control is the box itself (the yes/no segmented control). The scan line runs while
 * focus is anywhere inside a framed box. `children(focusHandlers, { focused, invalid })` renders the group.
 */
const ChoiceField = forwardRef(function ChoiceField({ id, label, error, className, framed = true, children }, ref) {
  const [focused, setFocused] = useState(false);
  const handlers = {
    onFocus: () => setFocused(true),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
    },
  };
  const invalid = Boolean(error);
  return (
    <div ref={ref} className={cn("relative", className)}>
      <p
        id={`${id}-label`}
        className={cn("mb-2 px-1 text-sm font-medium transition-colors duration-300", invalid ? "text-mv-danger" : focused ? "text-mv-violet-300" : "text-mv-text")}
      >
        <LabelText text={label} />
      </p>
      {framed ? (
        <FieldShell focused={focused} invalid={invalid} errorId={`${id}-error`} error={error}>
          {children(handlers, { focused, invalid })}
        </FieldShell>
      ) : (
        <>
          {children(handlers, { focused, invalid })}
          <FieldError id={`${id}-error`} error={error} />
        </>
      )}
    </div>
  );
});

export default ChoiceField;

/** Roving-focus keyboard handling shared by the radiogroups: arrows move and select (wrapping), Home/End jump. */
export function radioKeys(e, index, count, select) {
  let next = null;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + count) % count;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    select(index, false);
    return;
  }
  if (next == null) return;
  e.preventDefault();
  select(next, true);
}
