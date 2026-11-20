/**
 * Client-side CSV (RFC 4180 quoting and CRLF, ";" as separator, see SEP) with a UTF-8 BOM so Excel opens Greek text correctly.
 * Cells that start with = + - @ get a leading apostrophe so a spreadsheet never runs them as formulas.
 */
const cell = (value) => {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",;\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Semicolon-separated: Excel with a Greek (or most European) locale expects ";" and would otherwise put each row in
// one column. Google Sheets and Numbers detect it either way.
export const SEP = ";";
export const toCsv = (header, rows) => `﻿${[header, ...rows].map((r) => r.map(cell).join(SEP)).join("\r\n")}\r\n`;

export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** YYYY-MM-DD in the admin's own time zone. */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
