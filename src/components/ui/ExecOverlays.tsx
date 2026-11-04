import { useEffect, useRef, useState } from "react";
import { useStore } from "../../lib/store";
import { G, vibe } from "../../lib/uniforms";
import { audio } from "../../lib/audio";
import { TrendingUp, Target, CheckCircle2, Crown, Flame } from "lucide-react";

/* ---------------- CLIENT / MANAGER NODE ---------------- */
function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      const p = Math.min((t - t0) / 1400, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{v.toLocaleString()}{suffix}</span>;
}

export function ClientOverlay() {
  const setMode = useStore((s) => s.setMode);
  const burndown = "0,10 40,28 80,24 120,44 160,52 200,58 240,74 280,70 320,86 360,92 400,96 440,99 480,110";
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] pointer-events-auto p-3 sm:p-6">
      <div className="max-w-5xl mx-auto glass-hard edge-glow crownline relative p-5 sm:p-6" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <TrendingUp size={15} className="text-[var(--c1)]" />
            <span className="text-[10px] tracking-[0.3em] text-[var(--c1)]">CLIENT BRIEF // EXEC SUMMARY</span>
          </div>
          <button onClick={() => { vibe(8); setMode("sovereign"); }} className="text-[9px] text-[var(--dim)] hover:text-[var(--c1)] border border-white/15 px-2.5 py-1">RELEASE</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["DELIVERED BUILDS", 42, "+"],
            ["SYSTEM UPTIME", 99.98, "%", 2],
            ["SPRINTS CLEARED", 26, ""],
            ["MINDSET ROI", 312, "%"],
          ].map(([k, v, s]: any) => (
            <div key={k} className="border border-white/10 bg-black/30 p-4">
              <div className="text-[8px] tracking-[0.25em] text-[var(--dim)]">{k}</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-50"><Count to={v} suffix={s} /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
          <div className="md:col-span-3 border border-white/10 bg-black/30 p-4">
            <div className="text-[8px] tracking-[0.25em] text-[var(--dim)] mb-2">DISCIPLINE BURN-UP (2014 → 2026)</div>
            <svg viewBox="0 0 480 120" className="w-full h-28">
              <defs>
                <linearGradient id="burn" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              {[30, 60, 90].map((y) => <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.07)" />)}
              <polyline points={burndown} fill="none" stroke="url(#burn)" strokeWidth="2.4" strokeLinejoin="round" />
              <circle cx="480" cy="110" r="4" fill="#38bdf8"><animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" /></circle>
            </svg>
          </div>
          <div className="md:col-span-2 border border-white/10 bg-black/30 p-4">
            <div className="text-[8px] tracking-[0.25em] text-[var(--dim)] mb-2.5">MILESTONE LEDGER</div>
            {["Class 10 — 83% shipped", "Class 12 PCM+IP — 69% shipped", "Black Belt — production", "Sports Head — promoted", "Cyber Ops — ongoing"].map((m) => (
              <div key={m} className="flex items-center gap-2 text-[10px] text-slate-300 py-1">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> {m}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-[9px] text-[var(--dim)]/80 flex items-center gap-2">
          <Target size={10} className="text-[var(--c2)]" />
          STAKEHOLDER NOTE: subject converts impossible deadlines into undefeated streaks. Recommend unlimited backing.
        </div>
      </div>
    </div>
  );
}

/* ---------------- BOSS / OWNER / CEO NODE ---------------- */
export function BossOverlay() {
  const setMode = useStore((s) => s.setMode);
  const setBloodline = useStore((s) => s.setBloodline);
  const [hold, setHold] = useState(0);
  const [decree, setDecree] = useState(false);
  const holding = useRef(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      setHold((h) => {
        const next = holding.current ? h + 0.012 : Math.max(0, h - 0.05);
        if (next >= 1) {
          holding.current = false;
          trigger();
          return 0;
        }
        return next;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const trigger = () => {
    vibe([40, 60, 40, 120]);
    audio.fracture();
    setBloodline(true);
    document.documentElement.classList.add("bloodline");
    G.glitch = 1;
    setDecree(true);
    setTimeout(() => { G.glitch = 0; }, 400);
    setTimeout(() => {
      document.documentElement.classList.remove("bloodline");
      setBloodline(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2600);
    setTimeout(() => setDecree(false), 3900);
  };

  return (
    <>
      <div className="fixed top-20 left-3 sm:left-6 z-[70] w-[330px] max-w-[92vw] pointer-events-auto space-y-3">
        <div className="glass-hard edge-glow crownline relative p-5" style={{ borderRadius: 2 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[var(--c1)]"><Crown size={13} /> EXECUTIVE OVERRIDE</span>
            <button onClick={() => { vibe(8); setMode("sovereign"); }} className="text-[9px] text-[var(--dim)] hover:text-[var(--c1)] border border-white/15 px-2 py-0.5">RELEASE</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              ["GLOBAL FREQUENCY", "∞"],
              ["MARKET DOMINION", "100%"],
              ["DISCIPLINE CAPITAL", "10Y+"],
              ["SUCCESSION PLAN", "SELF"],
            ].map(([k, v]) => (
              <div key={k} className="border border-white/10 bg-black/40 py-3">
                <div className="text-[8px] text-[var(--dim)]">{k}</div>
                <div className="text-lg font-extrabold text-slate-50 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[9px] text-[var(--dim)] leading-4 border-l-2 border-[var(--c1)]/50 pl-2">
            "Empires are not inherited. They are compiled — one disciplined commit at a time." — A.S.
          </div>

          {/* power override */}
          <button
            onPointerDown={() => { holding.current = true; audio.blip(90, 0.4, 0.14, "sawtooth"); }}
            onPointerUp={() => (holding.current = false)}
            onPointerLeave={() => (holding.current = false)}
            className="mt-4 w-full relative overflow-hidden border border-rose-500/50 py-4 text-[11px] font-extrabold tracking-[0.3em] text-rose-200 select-none"
            style={{ borderRadius: 2 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-600/70 to-amber-500/70 transition-none" style={{ transform: `scaleX(${hold})`, transformOrigin: "left" }} />
            <span className="relative flex items-center justify-center gap-2"><Flame size={13} /> HOLD — CHANGE THE ENTIRE BLOODLINE</span>
          </button>
          <div className="mt-1.5 text-[8px] text-[var(--dim)]/70 text-center">irreversible. resets the site under your absolute authority.</div>
        </div>
      </div>

      {decree && (
        <div className="fixed inset-0 z-[90] grid place-items-center pointer-events-none">
          <div className="text-center px-6">
            <div className="text-[10px] tracking-[0.6em] text-rose-400 mb-3">EXECUTIVE DECREE EXECUTED</div>
            <div className="mono-display font-extrabold text-[clamp(1.8rem,6vw,4.6rem)] leading-tight text-slate-50" style={{ textShadow: "0 0 40px rgba(244,63,94,.7)" }}>
              THE BLOODLINE<br />HAS BEEN REWRITTEN
            </div>
            <div className="mt-4 text-[10px] tracking-[0.35em] text-amber-300">AYUSH SHRIVASTAVA PROTOCOL :: ABSOLUTE // DESTINY RECOMPILED</div>
          </div>
        </div>
      )}
    </>
  );
}
