import { ID } from "../../lib/data";

function Kinetic({ text, cls }: { text: string; cls: string }) {
  return (
    <span className="block whitespace-nowrap" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className={`${cls} will-change-transform`} style={{ animationDelay: `${(i % 10) * 0.17}s` }} aria-hidden>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export default function KineticTitle({ compact = false }: { compact?: boolean }) {
  return (
    <div className="select-none relative">
      {/* watermark ghost of the sovereign name */}
      <div
        className="watermark imperial font-black uppercase pointer-events-none absolute -top-[0.55em] left-0 opacity-[0.5] hidden md:block"
        style={{ fontSize: compact ? "clamp(3rem,9vw,7rem)" : "clamp(5rem,17vw,15rem)" }}
        aria-hidden
      >
        AYUSH SHRIVASTAVA
      </div>

      <h1 className={`relative ${compact ? "" : "pt-[0.6em] md:pt-[0.85em]"}`}>
        <span className="block overflow-hidden">
          <span
            className="mono-display font-extrabold uppercase leading-[0.95] text-[clamp(1.5rem,4.4vw,3.4rem)]"
            style={{ color: "var(--c1)", textShadow: "0 0 30px color-mix(in srgb, var(--c1) 45%, transparent)" }}
          >
            <Kinetic text={ID.sloganA} cls="kin-a" />
          </span>
        </span>

        <span className="block overflow-hidden mt-1 sm:mt-2">
          <span
            className={`imperial font-black uppercase leading-[0.92] ${
              compact ? "text-[clamp(1.9rem,5.6vw,4rem)]" : "text-[clamp(2.3rem,8vw,7rem)]"
            }`}
          >
            <span className="tx-grad tx-glow">
              <Kinetic text={ID.sloganB} cls="kin-b" />
            </span>
          </span>
        </span>
      </h1>
    </div>
  );
}
