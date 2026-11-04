import { useEffect, useRef, useState } from "react";
import { BOOT_LINES, ID } from "../../lib/data";
import { useStore } from "../../lib/store";
import { G } from "../../lib/uniforms";

export default function Boot() {
  const setPhase = useStore((s) => s.setPhase);
  const [lines, setLines] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [stat, setStat] = useState("INIT");
  const done = useRef(false);

  const engage = (skip = false) => {
    if (done.current) return;
    done.current = true;
    setStat(skip ? "BYPASSED" : "COMPLETE");
    setPct(100);
    setTimeout(
      () => {
        if (skip) {
          G.awakened = true;
          document.body.classList.remove("locked");
          setPhase("live");
        } else {
          setPhase("intro");
        }
      },
      skip ? 100 : 650
    );
  };

  useEffect(() => {
    document.body.classList.add("locked");
    G.awakened = false;
    let li = 0;
    const lineTimer = setInterval(() => {
      setLines((prev) => (li < BOOT_LINES.length ? [...prev, BOOT_LINES[li]] : prev));
      li++;
      if (li > BOOT_LINES.length) clearInterval(lineTimer);
    }, 240);
    let p = 0;
    const pctTimer = setInterval(() => {
      p = Math.min(100, p + 2 + Math.random() * 5);
      setPct(Math.floor(p));
      if (p >= 100) {
        clearInterval(pctTimer);
        engage();
      }
    }, 130);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") engage(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(lineTimer);
      clearInterval(pctTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#04060b] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-hard edge-glow relative overflow-hidden" style={{ borderRadius: 2 }}>
        {/* sweep */}
        <div className="absolute left-0 right-0 h-px bg-cyan-400/40" style={{ animation: "sweep 2.2s linear infinite" }} />
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-[10px] tracking-[0.3em] text-cyan-200/70">
          <span>AKSPN/OS // SOVEREIGN BOOT</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
            {stat}
          </span>
        </div>
        <div className="p-5 h-72 overflow-hidden text-[12px] leading-6 text-cyan-100/80">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-purple-400/70 select-none">{String(i).padStart(3, "0")}</span>
              <span>{l}</span>
            </div>
          ))}
          <div className="flex gap-3">
            <span className="text-purple-400/70">{"\u22EE"}</span>
            <span className="caret">█</span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex justify-between text-[10px] tracking-[0.25em] text-cyan-200/60 mb-1.5">
            <span>SYSTEM ALLOCATION</span>
            <span>{pct}%</span>
          </div>
          <div className="h-[3px] bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-150" style={{ width: `${pct}%`, boxShadow: "0 0 12px #22d3ee" }} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] text-slate-500">
              IDENTITY LEDGER :: {ID.name.toUpperCase()} — {ID.handle}
            </p>
            <button
              onClick={() => engage(true)}
              className="text-[10px] tracking-[0.25em] text-cyan-300/80 hover:text-cyan-100 border border-cyan-400/30 hover:border-cyan-300 px-3 py-1.5 transition-colors pointer-events-auto"
            >
              SKIP SEQUENCE [ENTER]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
