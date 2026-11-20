import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import FieldShell, { LabelText } from "@/components/feedback/FieldShell";

const MAX_TEXTAREA = 360; // px; past this the textarea scrolls instead of growing

/**
 * Text input or auto-growing textarea with a floating label: the label rests inside the field and lifts into the
 * notched top border on focus or once filled (scaled to 75%, matching the 12px legend that cuts the notch).
 * A character count appears only near `maxLength`.
 */
const FloatingField = forwardRef(function FloatingField(
  { id, label, value, onChange, onBlur, multiline = false, maxLength, error, rows = 3, shellRef, ...props },
  ref,
) {
  const control = useRef(null);
  useImperativeHandle(ref, () => control.current);
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const errorId = `${id}-error`;

  // Auto-grow: measure the content height on every change (and on width changes, which rewrap the text).
  useLayoutEffect(() => {
    if (!multiline) return undefined;
    const el = control.current;
    const fit = () => {
      el.style.height = "auto";
      const h = Math.min(el.scrollHeight, MAX_TEXTAREA);
      el.style.height = `${h}px`;
      el.style.overflowY = el.scrollHeight > MAX_TEXTAREA ? "auto" : "hidden";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [multiline, value]);

  const Control = multiline ? "textarea" : "input";
  const near = maxLength && value.length >= maxLength * 0.9;

  return (
    <FieldShell
      ref={shellRef}
      legend={label}
      floated={floated}
      focused={focused}
      invalid={Boolean(error)}
      errorId={errorId}
      error={error}
    >
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] origin-top-left font-sans leading-6 transition-[transform,color] duration-300 ease-mv-out",
          floated
            ? "max-w-[calc(133%-38px)] truncate text-mv-text"
            : "max-w-[calc(100%-32px)] text-mv-muted",
          floated && focused && !error && "text-mv-violet-300",
          floated && error && "text-mv-danger",
        )}
        style={{ transform: floated ? "translate(14px, -9px) scale(0.75)" : "translate(16px, 16px) scale(1)" }}
      >
        <LabelText text={label} />
      </label>
      <Control
        ref={control}
        id={id}
        name={id}
        value={value}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        aria-required="true"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "relative block w-full resize-none rounded-input bg-transparent px-4 text-base leading-6 text-mv-text caret-mv-violet-400 outline-none focus-visible:outline-none",
          "autofill:shadow-[inset_0_0_0_1000px_rgb(var(--mv-surface-2))] autofill:[-webkit-text-fill-color:rgb(var(--mv-text))]",
          multiline ? "min-h-[112px] pb-4 pt-4" : "h-14 py-4",
          near && "pb-8",
        )}
        {...props}
      />
      {near && (
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] text-mv-muted">
          {value.length} / {maxLength}
        </span>
      )}
    </FieldShell>
  );
});

export default FloatingField;
