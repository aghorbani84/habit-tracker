/**
 * Faravahar — one small, tasteful winged-disc silhouette in the header,
 * gold (currentColor) on transparent, ~28px tall. Stylised, not a replica:
 * a central ring, layered wing feathers left and right, and a tail fan.
 * Used in exactly one place (the app header, Achaemenid style only).
 */
export function Faravahar() {
  return (
    <svg
      className="faravahar"
      viewBox="0 0 56 28"
      width="56"
      height="28"
      aria-hidden="true"
      focusable="false"
    >
      {/* Left wing — three feather rows, longest at the top */}
      <path d="M23 12 C17 5 9 3 3 6 C9 8 15 10 21 14 Z" fill="currentColor" />
      <path d="M23 15 C18 11 11 10 5 12 C11 13 16 15 21 17 Z" fill="currentColor" />
      <path d="M23 18 C19 15 13 15 8 17 C13 18 17 19 21 20 Z" fill="currentColor" />
      {/* Right wing — mirror */}
      <path d="M33 12 C39 5 47 3 53 6 C47 8 41 10 35 14 Z" fill="currentColor" />
      <path d="M33 15 C38 11 45 10 51 12 C45 13 40 15 35 17 Z" fill="currentColor" />
      <path d="M33 18 C37 15 43 15 48 17 C43 18 39 19 35 20 Z" fill="currentColor" />
      {/* Central ring */}
      <circle cx="28" cy="14" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="28" cy="14" r="1.3" fill="currentColor" />
      {/* Tail fan */}
      <path
        d="M25 19 L23 25 M28 19.5 L28 26 M31 19 L33 25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
