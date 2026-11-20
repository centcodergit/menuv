/** Simple, recognisable sign-in marks (decorative; the button text names the provider). */
export function GoogleMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.04 12.26c0-.82-.07-1.6-.21-2.36H12v4.46h6.19a5.3 5.3 0 0 1-2.3 3.47v2.89h3.72c2.18-2 3.43-4.96 3.43-8.46Z" />
      <path fill="#34A853" d="M12 23.5c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.53-2.02-6.44-4.74H1.72v2.98A11.5 11.5 0 0 0 12 23.5Z" />
      <path fill="#FBBC05" d="M5.56 14.18a6.9 6.9 0 0 1 0-4.36V6.84H1.72a11.5 11.5 0 0 0 0 10.32l3.84-2.98Z" />
      <path fill="#EA4335" d="M12 5.08c1.69 0 3.21.58 4.4 1.72l3.3-3.3A11.06 11.06 0 0 0 12 .5 11.5 11.5 0 0 0 1.72 6.84l3.84 2.98C6.47 7.1 9 5.08 12 5.08Z" />
    </svg>
  );
}

export function MicrosoftMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="10" height="10" fill="#F25022" />
      <rect x="12.5" y="1.5" width="10" height="10" fill="#7FBA00" />
      <rect x="1.5" y="12.5" width="10" height="10" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
