import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/feedback/FieldShell";

export const OTP_LENGTH = 6;

/**
 * 6-digit confirmation code: one real input (numeric keypad, one-time-code autofill, paste) stretched invisibly
 * over six drawn slots, so screen readers and password managers see a single field. Non-digits are dropped.
 */
const OtpField = forwardRef(function OtpField({ id, label, value, onChange, error, disabled, shellRef }, ref) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  const active = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <div ref={shellRef}>
      <label htmlFor={id} className="mb-3 block text-sm font-medium text-mv-text">
        {label}
      </label>
      <div className="relative">
        <div aria-hidden="true" className="grid grid-cols-6 gap-2 sm:gap-2.5">
          {Array.from({ length: OTP_LENGTH }, (_, i) => {
            const digit = value[i] ?? "";
            const current = focused && i === active;
            return (
              <span
                key={i}
                className={cn(
                  "relative flex h-14 items-center justify-center rounded-input border bg-mv-surface-2/40 font-mono text-xl font-medium text-mv-text transition-[border-color,box-shadow] duration-300",
                  error
                    ? "border-mv-danger"
                    : current
                      ? "border-mv-violet-400 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.14)]"
                      : digit
                        ? "border-mv-violet-400/50"
                        : "border-mv-muted/[0.5]",
                )}
              >
                {digit}
                {current && !digit && <span className="absolute bottom-3 h-[2px] w-4 rounded-full bg-mv-violet-400" />}
              </span>
            );
          })}
        </div>
        <input
          ref={ref}
          id={id}
          name="one-time-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={OTP_LENGTH}
          value={value}
          disabled={disabled}
          required
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          onFocus={(e) => {
            setFocused(true);
            const end = e.target.value.length;
            e.target.setSelectionRange(end, end);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
          className="absolute inset-0 h-full w-full cursor-text rounded-input bg-transparent text-base text-transparent opacity-0 outline-none [caret-color:transparent]"
        />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
});

export default OtpField;
