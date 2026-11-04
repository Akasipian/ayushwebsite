import { useEffect, useRef, useState } from "react";
import { useStore } from "../../lib/store";
import { vibe } from "../../lib/uniforms";
import { audio } from "../../lib/audio";
import { Gamepad2, Sparkles, Magnet } from "lucide-react";
import { SKILLS } from "../../lib/data";

type Chip = { el: HTMLDivElement | null; x: number; y: number; vx: number; vy: number; r: number };

export default function KidPlayground() {
  const { gravity, setGravity, setMode, orbsCollected, collectOrb } = useStore();
  const chips = useRef<Chip[]>(
    SKILLS.slice(0, 5).map((_, i) => ({
      el: null,
      x: 24 + i * 26,
      y: 34 + (i % 2) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 44,
    }))
  );
  const drag = useRef<{ i: number; px: number; py: number } | null>(null);
  const [toast, setToast] = useState("");
  const [burst, setBurst] = useState(-1);

  // orb spawn positions (percent) — deterministic scatter
  const orbs = [
    { x: 8, y: 22 }, { x: 86, y: 30 }, { x: 14, y: 58 }, { x: 78, y: 66 },
    { x: 46, y: 18 }, { x: 60, y: 82 }, { x: 28, y: 80 }, { x: 90, y: 84 },
  ];

  /* physics loop */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.03);
      last = now;
      const W = window.innerWidth, H = window.innerHeight;
      chips.current.forEach((c, i) => {
        if (!c.el) return;
        if (drag.current?.i !== i) {
          if (gravity) c.vy += 900 * dt;
          else {
            c.vx += Math.sin(now / 700 + i * 2) * 9 * dt;
            c.vy += Math.cos(now / 900 + i * 3) * 9 * dt;
            c.vx *= 0.996; c.vy *= 0.996;
          }
          c.x += c.vx * dt; c.y += c.vy * dt;
          const r = c.r;
          if (c.x < r) { c.x = r; c.vx = Math.abs(c.vx) * 0.82; }
          if (c.x > W - r) { c.x = W - r; c.vx = -Math.abs(c.vx) * 0.82; }
          if (c.y < r + 60) { c.y = r + 60; c.vy = Math.abs(c.vy) * 0.82; }
          if (c.y > H - r) { c.y = H - r; c.vy = -Math.abs(c.vy) * 0.82; }
        }
        c.el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%,-50%) rotate(${Math.sin(now / 600 + i) * (gravity ? 2 : 9)}deg)`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gravity]);

  useEffect(() => {
    if (orbsCollected.length === orbs.length) {
      setToast("ALL SIGNAL SHARDS COLLECTED — RANK UP: CHUNIN OF THE GRID");
      audio.transmit();
      vibe([30, 40, 30, 80]);
    }
  }, [orbsCollected.length]);

  return (
    <>
      {/* control panel */}
      <div className="fixed top-20 left-3 sm:left-6 z-[70] w-[280px] max-w-[90vw] pointer-events-auto">
        <div className="glass-hard edge-glow crownline relative p-4" style={{ borderRadius: 2 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[var(--c3)]"><Gamepad2 size={13} /> ARCADE LAYER</span>
            <button onClick={() => { vibe(8); setMode("sovereign"); }} className="text-[9px] text-[var(--dim)] hover:text-[var(--c1)] border border-white/15 px-2 py-0.5 rounded-full">RELEASE</button>
          </div>
          <p className="text-[9px] leading-4 text-[var(--dim)]">2nd class — first touch of a computer. 16 June 2015 — karate dream day-one. this layer is for that kid.</p>
          <button
            onClick={() => { setGravity(!gravity); vibe(14); audio.blip(gravity ? 500 : 300, 0.1, 0.1); }}
            className="mt-3 w-full py-3 text-[10px] font-extrabold tracking-[0.25em] uppercase bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] text-black hover:brightness-125 transition"
          >
            <Magnet size={11} className="inline mr-1 -mt-0.5" /> GRAVITY: {gravity ? "ON (DROP EM')" : "OFF (ZERO-G)"}
          </button>
          <div className="mt-2 text-[8px] text-[var(--dim)]/80 text-center">throw the skill chips. they bounce. obviously.</div>
          <div className="mt-3 text-[10px] text-slate-200 flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--c3)]" /> shards: {orbsCollected.length}/{orbs.length}
          </div>
          {toast && <div className="mt-2 text-[9px] text-[var(--c3)] animate-pulse">{toast}</div>}
        </div>
      </div>

      {/* throwable skill chips */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        {chips.current.map((c, i) => (
          <div
            key={i}
            ref={(el) => { chips.current[i].el = el; }}
            onPointerDown={(e) => {
              drag.current = { i, px: e.clientX, py: e.clientY };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              vibe(10);
            }}
            onPointerMove={(e) => {
              if (drag.current?.i === i) {
                const cEl = chips.current[i];
                cEl.vx = (e.clientX - drag.current.px) * 14;
                cEl.vy = (e.clientY - drag.current.py) * 14;
                cEl.x = e.clientX; cEl.y = e.clientY;
                drag.current.px = e.clientX; drag.current.py = e.clientY;
              }
            }}
            onPointerUp={() => { drag.current = null; vibe(6); }}
            className="absolute left-0 top-0 px-4 py-2.5 glass edge-glow text-[10px] font-extrabold tracking-widest text-slate-100 cursor-grab active:cursor-grabbing pointer-events-auto select-none touch-none"
            style={{ borderRadius: 999, willChange: "transform", transform: `translate(${c.x}px, ${c.y}px)` }}
          >
            {SKILLS[i].label}
          </div>
        ))}
      </div>

      {/* signal shards */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        {orbs.map((o, i) =>
          orbsCollected.includes(i) ? null : (
            <button
              key={i}
              onClick={() => { collectOrb(i); setBurst(i); setTimeout(() => setBurst(-1), 600); vibe([8, 24]); audio.blip(900 + i * 120, 0.09, 0.09); }}
              className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full pointer-events-auto ${burst === i ? "scale-[2.6] opacity-0" : "animate-bounce"}`}
              style={{
                left: `${o.x}%`, top: `${o.y}%`,
                background: "radial-gradient(circle at 35% 35%, #fff, var(--c3) 45%, var(--c2))",
                boxShadow: "0 0 16px var(--c3), 0 0 40px var(--c2)",
                transition: "transform .5s, opacity .5s",
                animationDelay: `${i * 0.23}s`,
              }}
              title={`signal shard ${i + 1}`}
            />
          )
        )}
      </div>
    </>
  );
}
