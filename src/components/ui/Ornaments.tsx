import type { ReactNode } from "react";

/* ---------- 4-corner imperial frame ---------- */
export function Frame({ color = "var(--gold)", size = 13, inset = -1 }: { color?: string; size?: number; inset?: number }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
    borderStyle: "solid",
    borderWidth: 0,
    pointerEvents: "none",
    opacity: 0.9,
    zIndex: 2,
  };
  return (
    <>
      <span style={{ ...base, top: inset, left: inset, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...base, top: inset, right: inset, borderTopWidth: 1, borderRightWidth: 1 }} />
      <span style={{ ...base, bottom: inset, left: inset, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...base, bottom: inset, right: inset, borderBottomWidth: 1, borderRightWidth: 1 }} />
    </>
  );
}

/* ---------- Royal cypher seal ---------- */
export function Seal({ size = 44, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={spin ? "spin-slow" : ""} aria-hidden>
      <defs>
        <linearGradient id="sealg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold)" />
          <stop offset="0.5" stopColor="var(--c1)" />
          <stop offset="1" stopColor="var(--c2)" />
        </linearGradient>
      </defs>
      <polygon points="50,3 92,26 92,74 50,97 8,74 8,26" fill="none" stroke="url(#sealg)" strokeWidth="1.6" />
      <polygon points="50,11 85,30 85,70 50,89 15,70 15,30" fill="none" stroke="url(#sealg)" strokeWidth="0.7" opacity="0.5" />
      <g stroke="url(#sealg)" strokeWidth="2.1" strokeLinecap="round" fill="none">
        <path d="M30 66 L50 30 L70 66" />
        <path d="M38 54 L62 54" />
        <path d="M50 30 L50 22" />
      </g>
      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.35" strokeDasharray="3 7" />
    </svg>
  );
}

/* ---------- High-fidelity Ornamental divider with diamond ---------- */
export function Divider({ gold = false }: { gold?: boolean }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${gold ? 'via-[var(--gold)]/40' : 'via-[var(--line-strong)]/40'} to-transparent`} />
      <div className="relative">
        <span className="diamond block" style={{ opacity: 1, filter: gold ? 'drop-shadow(0 0 8px var(--gold))' : 'none' }} />
        <span className="absolute inset-0 diamond block animate-ping opacity-20 scale-150" />
      </div>
      <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${gold ? 'via-[var(--gold)]/40' : 'via-[var(--line-strong)]/40'} to-transparent`} />
    </div>
  );
}

/* ---------- Chapter heading ---------- */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function Chapter({
  num,
  title,
  sub,
  right,
}: {
  num: number;
  title: string;
  sub: string;
  right?: ReactNode;
}) {
  return (
    <div className="rv mb-12 sm:mb-16">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="shrink-0 pt-1">
            <div className="imperial text-[clamp(2.4rem,7vw,4.6rem)] leading-none tx-grad opacity-90">{ROMAN[num - 1]}</div>
            <div className="label mt-2 pl-0.5">CHAPTER</div>
          </div>
          <span className="w-px self-stretch bg-gradient-to-b from-[var(--gold)]/60 via-[var(--line-strong)] to-transparent" />
          <div>
            <div className="label-gold mb-2">{sub}</div>
            <h2
              className="imperial font-bold uppercase text-slate-100 leading-[1.02] text-[clamp(1.5rem,4.2vw,3rem)] g-target"
              data-text={title}
            >
              {title}
            </h2>
          </div>
        </div>
        {right && <div className="pb-2 shrink-0">{right}</div>}
      </div>
      <div className="rule-gold mt-6" />
    </div>
  );
}

/* ---------- Small metric ---------- */
export function Metric({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2.5 border-l border-[var(--line-strong)] first:border-l-0">
      <div className="label leading-none">{k}</div>
      <div className={`mt-1.5 text-[12px] font-bold tnum ${accent ? "tx-gold" : "text-slate-100"}`}>{v}</div>
    </div>
  );
}

/* ---------- Micro label chip ---------- */
export function Chip({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "cyan" | "dim" }) {
  const cls =
    tone === "gold"
      ? "border-[var(--gold)]/45 text-[var(--gold)]"
      : tone === "cyan"
      ? "border-[var(--c1)]/40 text-[var(--c1)]"
      : "border-white/12 text-[var(--dim)]";
  return <span className={`inline-block border px-2 py-1 text-[8px] tracking-[0.3em] uppercase ${cls}`}>{children}</span>;
}

/* ---------- Corner Brackets ---------- */
export function Brackets({ size = 20, inset = 0 }: { size?: number; inset?: number }) {
  const b = { position: "absolute", width: size, height: size, border: "1px solid var(--line-strong)", pointerEvents: "none" } as any;
  return (
    <>
      <span style={{ ...b, top: inset, left: inset, borderRight: 0, borderBottom: 0 }} />
      <span style={{ ...b, top: inset, right: inset, borderLeft: 0, borderBottom: 0 }} />
      <span style={{ ...b, bottom: inset, left: inset, borderRight: 0, borderTop: 0 }} />
      <span style={{ ...b, bottom: inset, right: inset, borderLeft: 0, borderTop: 0 }} />
    </>
  );
}

/* ---------- Telemetry Dial ---------- */
export function Dial({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="spin-slow opacity-40">
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 4" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="49.5" y="2" width="1" height="6" fill="var(--gold)" transform={`rotate(${i * 30} 50 50)`} opacity="0.6" />
      ))}
    </svg>
  );
}


/* ---------- Readability scrim behind text columns ---------- */
export function Scrim({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      style={{ background: "radial-gradient(70% 60% at 50% 40%, rgba(3,5,9,0.72), transparent 75%)" }}
    />
  );
}
