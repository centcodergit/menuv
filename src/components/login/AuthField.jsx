import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import FieldShell from "@/components/feedback/FieldShell";

/**
 * Floating-label input in the Feedback form's style (7.12): the shared notched FieldShell, the label lifting into
 * the border on focus or once filled. Password fields get a show/hide toggle inside the frame. Unlike the feedback
 * fields there is no required asterisk (every field on the login card is required and says so through aria).
 * Browser autofill is detected so the label lifts out of the way of autofilled text.
 */
const AuthField = forwardRef(function AuthField(
  { id, label, value, onChange, onBlur, error, hint, type = "text", showLabel, hideLabel, shellRef, disabled, ...props },
  ref,
) {
  const control = useRef(null);
  useImperativeHandle(ref, () => control.current);
  const [focused, setFocused] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [shown, setShown] = useState(false);
  const floated = focused || value.length > 0 || autofilled;
  const isPassword = type === "password";
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  // Chrome fills saved credentials before the visitor interacts and doesn't fire change events until then.
  useEffect(() => {
    const check = () => {
      try {
        setAutofilled(Boolean(control.current?.matches(":-webkit-autofill")));
      } catch {
        /* selector unsupported */
      }
    };
    const ids = [150, 700, 1600].map((ms) => window.setTimeout(check, ms));
    return () => ids.forEach((i) => window.clearTimeout(i));
  }, []);

  return (
    <div>
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
            floated ? "max-w-[calc(133%-38px)] truncate text-mv-text" : "max-w-[calc(100%-32px)] text-mv-muted",
            floated && focused && !error && "text-mv-violet-300",
            floated && error && "text-mv-danger",
          )}
          style={{ transform: floated ? "translate(14px, -9px) scale(0.75)" : "translate(16px, 16px) scale(1)" }}
        >
          {label}
        </label>
        <input
          ref={control}
          id={id}
          name={id}
          type={isPassword && shown ? "text" : type}
          value={value}
          disabled={disabled}
          required
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={hint ? `${errorId} ${hintId}` : errorId}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setAutofilled(false);
            onChange(e.target.value);
          }}
          className={cn(
            "relative block h-14 w-full rounded-input bg-transparent px-4 py-4 text-base leading-6 text-mv-text caret-mv-violet-400 outline-none focus-visible:outline-none disabled:opacity-70",
            "autofill:shadow-[inset_0_0_0_1000px_rgb(var(--mv-surface-2))] autofill:[-webkit-text-fill-color:rgb(var(--mv-text))]",
            isPassword && "pr-14",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? hideLabel : showLabel}
            aria-pressed={shown}
            aria-controls={id}
            disabled={disabled}
            className="absolute right-1 top-1 z-[2] flex h-12 w-12 items-center justify-center rounded-[11px] text-mv-muted transition-colors hover:text-mv-text"
          >
            {shown ? <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        )}
      </FieldShell>
      {hint && (
        <p id={hintId} className={cn("px-1 pt-2 text-sm text-mv-muted", error && "sr-only")}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default AuthField;
