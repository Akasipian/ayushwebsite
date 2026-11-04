/** SVG feTurbulence grain overlay — Awwwards standard depth trick */
export default function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 z-[92] pointer-events-none"
      style={{ opacity: 0.032, mixBlendMode: "overlay" }}
      aria-hidden
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
