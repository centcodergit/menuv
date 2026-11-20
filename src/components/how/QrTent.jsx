import { useId } from "react";
import { URL_QR } from "@/content/qr";

const QR_N = URL_QR.size; // 25
const GAP = 0.08; // gap around each module, in module units
const R = 0.24; // module corner radius

const inFinder = (x, y) => (x < 7 && y < 7) || (x >= QR_N - 7 && y < 7) || (x < 7 && y >= QR_N - 7);

const roundedRect = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;

/** Data modules as soft rounded squares (one path), finder patterns excluded (drawn separately as "eyes"). */
const MODULES_D = (() => {
  let d = "";
  for (let y = 0; y < QR_N; y += 1)
    for (let x = 0; x < QR_N; x += 1)
      if (URL_QR.bits[y * QR_N + x] === "1" && !inFinder(x, y)) d += roundedRect(x + GAP, y + GAP, 1 - 2 * GAP, 1 - 2 * GAP, R);
  return d;
})();

/** The three finder "eyes": a rounded 7×7 ring around a rounded 3×3 pupil. */
const EYES = [
  [0, 0],
  [QR_N - 7, 0],
  [0, QR_N - 7],
];
const RING_D = EYES.map(([x, y]) => `${roundedRect(x + 0.1, y + 0.1, 6.8, 6.8, 1.9)}${roundedRect(x + 1.05, y + 1.05, 4.9, 4.9, 1.2)}`).join("");
const PUPIL_D = EYES.map(([x, y]) => roundedRect(x + 2.05, y + 2.05, 2.9, 2.9, 0.85)).join("");

/**
 * A printed QR table tent for the "share it" step (104 × 142 px, pivoting on its bottom edge): matte card with a
 * violet header band and the Menuverse mark, the code of https://menuverse.eu with rounded modules and finder
 * eyes, and the table number on a small pill. The parent animates `[data-tent]`, the scan reveal
 * `[data-qr-wipe]` (clip height 0 → 25) and the scan bar `[data-qr-bar]`. `drawn`: show the code fully.
 */
export default function QrTent({ label, drawn = false, className, style }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div data-tent className={`absolute h-[142px] w-[104px] ${className ?? ""}`} style={{ transformOrigin: "50% 100%", ...style }}>
      {/* contact shadow on the table */}
      <span
        className="absolute -bottom-3 left-1/2 h-6 w-[150px] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.65), transparent)" }}
      />
      <svg viewBox="0 0 104 142" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`paper-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E9E5F3" />
          </linearGradient>
          <linearGradient id={`side-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A79FBE" />
            <stop offset="1" stopColor="#6F6789" />
          </linearGradient>
          <linearGradient id={`band-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#5B21B6" />
          </linearGradient>
          <clipPath id={`face-${uid}`}>
            <path d="M13 3h70a5 5 0 0 1 5 4.5L95 135a5 5 0 0 1-5 5.5H6a5 5 0 0 1-5-5.5L8 7.5A5 5 0 0 1 13 3z" />
          </clipPath>
        </defs>
        {/* back panel of the A-frame, seen past the right edge */}
        <path d="M84 4L102 138a3 3 0 0 1-3 3.4H92L86 8z" fill={`url(#side-${uid})`} />
        {/* front face */}
        <path d="M13 3h70a5 5 0 0 1 5 4.5L95 135a5 5 0 0 1-5 5.5H6a5 5 0 0 1-5-5.5L8 7.5A5 5 0 0 1 13 3z" fill={`url(#paper-${uid})`} />
        <g clipPath={`url(#face-${uid})`}>
          {/* header band with the Menuverse mark */}
          <rect x="0" y="0" width="104" height="20" fill={`url(#band-${uid})`} />
          <g transform="translate(45.5 6.5)" fill="#FFFFFF">
            <rect x="0" y="0" width="5.4" height="5.4" rx="1.4" />
            <rect x="7.2" y="0" width="5.4" height="5.4" rx="1.4" opacity="0.85" />
            <rect x="0" y="7.2" width="5.4" height="5.4" rx="1.4" opacity="0.85" />
            <rect x="8.3" y="8.3" width="3" height="3" rx="0.9" opacity="0.7" />
          </g>
          {/* paper sheen */}
          <path d="M0 20L104 20L104 34C70 28 30 30 0 40z" fill="#FFFFFF" opacity="0.35" />
        </g>
        {/* inner edge highlight */}
        <path d="M13 3.6h70a4.4 4.4 0 0 1 4.4 4" fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="0.8" />
      </svg>

      {/* the code, on a white tile */}
      <div className="absolute left-[19px] top-[27px] h-[66px] w-[66px] rounded-[8px] bg-white p-[5px] shadow-[0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(76,29,149,0.12),0_6px_14px_-8px_rgba(46,16,101,0.45)]">
        <svg viewBox={`0 0 ${QR_N} ${QR_N}`} className="h-full w-full overflow-visible">
          <defs>
            <clipPath id={`wipe-${uid}`}>
              <rect data-qr-wipe x="-1" y="-1" width={QR_N + 2} height={drawn ? QR_N + 2 : 0} />
            </clipPath>
          </defs>
          <g clipPath={`url(#wipe-${uid})`}>
            <path d={MODULES_D} fill="#14111F" />
            <path d={RING_D} fill="#3B1A78" fillRule="evenodd" />
            <path d={PUPIL_D} fill="#14111F" />
          </g>
          <rect data-qr-bar x="-1.5" y="-1" width={QR_N + 3} height="0.9" rx="0.45" fill="#8B5CF6" opacity="0" style={{ filter: "drop-shadow(0 0 1.2px #A78BFA)" }} />
        </svg>
      </div>

      {/* table number */}
      <p className="absolute inset-x-0 top-[103px] flex justify-center">
        <span className="max-w-[78px] truncate rounded-full bg-[#EDE9FE] px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#4C1D95]">
          {label}
        </span>
      </p>
    </div>
  );
}
