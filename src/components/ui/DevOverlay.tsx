import { useEffect, useRef, useState } from "react";
import { useStore } from "../../lib/store";
import { G, vibe } from "../../lib/uniforms";
import { Bug, Boxes, MousePointerClick } from "lucide-react";

type BugT = { id: string; text: string; sev: "LOW" | "HIGH" | "FATAL" };
const SEED_BUGS: BugT[] = [
  { id: "BUG#000", text: "1-week hyper-focus sprint — forgot what sleep() is", sev: "HIGH" },
  { id: "BUG#013", text: "peak couch laziness overflow — stack unwound to sofa", sev: "LOW" },
  { id: "BUG#404", text: "motivation not found. karate fixed it.", sev: "FATAL" },
];

export default function DevOverlay() {
  const setMode = useStore((s) => s.setMode);
  const [boxes, setBoxes] = useState(false);
  const [bugs, setBugs] = useState<BugT[]>(SEED_BUGS);
  const [draft, setDraft] = useState("");
  const [heap, setHeap] = useState("—");
  const [clicks, setClicks] = useState<{ x: number; y: number; id: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hist = useRef<number[]>(new Array(90).fill(60));
  const clickId = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("debug-boxes", boxes);
    return () => document.documentElement.classList.remove("debug-boxes");
  }, [boxes]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let frames = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      frames++;
      const now = performance.now();
      acc += now - last;
      last = now;
      if (acc >= 250) {
        hist.current.push(Math.min((frames * 1000) / acc, 120));
        hist.current.shift();
        frames = 0;
        acc = 0;
        const mem = (performance as any).memory;
        setHeap(mem ? `${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB` : "n/a");
        const c = canvasRef.current;
        if (c) {
          const x = c.getContext("2d")!;
          x.clearRect(0, 0, c.width, c.height);
          x.strokeStyle = "rgba(52,211,153,0.9)";
          x.lineWidth = 1.4;
          x.beginPath();
          hist.current.forEach((v, i) => {
            const px = (i / (hist.current.length - 1)) * c.width;
            const py = c.height - (v / 120) * c.height;
            i ? x.lineTo(px, py) : x.moveTo(px, py);
          });
          x.stroke();
          x.fillStyle = "rgba(96,165,250,0.12)";
          x.fillRect(0, c.height - (60 / 120) * c.height, c.width, 1);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    const onClick = (e: MouseEvent) => {
      const id = ++clickId.current;
      setClicks((c) => [...c.slice(-40), { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => setClicks((c) => c.filter((k) => k.id !== id)), 1300);
    };
    window.addEventListener("pointerdown", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return (
    <>
      {/* click hitbox tracker */}
      <div className="fixed inset-0 z-[65] pointer-events-none">
        {clicks.map((c) => (
          <div key={c.id} className="absolute w-8 h-8 -ml-4 -mt-4 border border-[var(--c1)] rounded-full" style={{ left: c.x, top: c.y, animation: "orb-burst 1.1s ease-out forwards" }} />
        ))}
      </div>

      <div className="fixed top-20 right-3 sm:right-6 z-[70] w-[320px] max-w-[92vw] pointer-events-auto space-y-3">
        <div className="glass-hard edge-glow crownline relative p-4" style={{ borderRadius: 2 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] tracking-[0.3em] text-[var(--c1)]">DEV/QA BLUEPRINT</span>
            <button onClick={() => { vibe(8); setMode("sovereign"); }} className="text-[9px] text-[var(--dim)] hover:text-[var(--c1)] border border-white/15 px-2 py-0.5">RELEASE</button>
          </div>

          <div className="flex items-center justify-between text-[9px] text-[var(--dim)] mb-1">
            <span className="flex items-center gap-1"><MousePointerClick size={10} /> FRAME LOOP</span>
            <span>heap: {heap}</span>
          </div>
          <canvas ref={canvasRef} width={288} height={52} className="w-full border border-white/10 bg-black/40" />
          <div className="flex justify-between text-[8px] text-[var(--dim)]/70 mt-1"><span>0fps</span><span>60 lock</span><span>120</span></div>

          <label className="mt-3 flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer select-none" onPointerEnter={() => vibe(5)}>
            <input type="checkbox" checked={boxes} onChange={(e) => { setBoxes(e.target.checked); vibe(8); }} className="accent-[#34d399]" />
            <Boxes size={12} className="text-[var(--c2)]" /> render hitboxes + wireframes on all DOM
          </label>
          <div className="mt-1.5 text-[8px] text-[var(--dim)]/70">
            sim: {G.quality === 1 ? "FULL STACK" : "ADAPTIVE 50%"} · dpr cap · scrollVel {G.scrollVel.toExponential(1)}
          </div>
        </div>

        {/* bug matrix */}
        <div className="glass-hard edge-glow p-4" style={{ borderRadius: 2 }}>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[var(--c3)] mb-3"><Bug size={12} /> BUG SUBMISSION MATRIX</div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {bugs.map((b) => (
              <div key={b.id} className="text-[9px] leading-4 border border-white/10 px-2 py-1.5 flex gap-2">
                <span className={b.sev === "FATAL" ? "text-rose-400" : b.sev === "HIGH" ? "text-amber-300" : "text-emerald-300"}>[{b.sev}]</span>
                <span className="text-slate-300 flex-1">{b.text}</span>
              </div>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setBugs((b) => [{ id: `BUG#${String(Math.floor(Math.random() * 900) + 100)}`, text: draft.trim(), sev: ["LOW", "HIGH"][Math.floor(Math.random() * 2)] as any }, ...b].slice(0, 8));
              setDraft("");
              vibe([8, 20]);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="report a defect in reality…"
              className="flex-1 bg-black/40 border border-white/10 focus:border-[var(--c1)]/50 outline-none px-2.5 py-2 text-[10px] text-slate-100"
            />
            <button className="px-3 text-[10px] font-bold bg-[var(--c1)] text-black">LOG</button>
          </form>
        </div>
      </div>
    </>
  );
}
