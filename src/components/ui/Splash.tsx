import { useEffect, useRef } from "react";
import { useStore } from "../../lib/store";
import { vibe } from "../../lib/uniforms";

/** Sacred milestone — 21 April 2014 cryptographic data splash. */
export default function Splash() {
  const { splash, setSplash } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!splash) return;
    vibe([30, 60, 30, 90]);
    const c = canvasRef.current!;
    const x = c.getContext("2d")!;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const cols = Math.floor(c.width / 18);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -40);
    const chars = "AKSPI210494❤$#%&カラテ武道";
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      x.fillStyle = "rgba(3,6,10,0.16)";
      x.fillRect(0, 0, c.width, c.height);
      x.font = "700 15px 'JetBrains Mono', monospace";
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        x.fillStyle = Math.random() > 0.86 ? "#f472b6" : Math.random() > 0.5 ? "#22d3ee" : "#a855f7";
        x.fillText(ch, i * 18, y * 18);
        drops[i] = y * 18 > c.height && Math.random() > 0.975 ? 0 : y + 0.9 + Math.random() * 0.6;
      });
    };
    draw();
    const t = setTimeout(() => setSplash(false), 4600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [splash, setSplash]);

  if (!splash) return null;
  return (
    <div className="fixed inset-0 z-[95] pointer-events-auto cursor-pointer" onClick={() => setSplash(false)} style={{ animation: "splash-in 4.6s ease both" }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center px-6">
          <div className="text-[10px] tracking-[0.6em] text-cyan-300 mb-4">CRYPTOGRAPHIC ANOMALY DETECTED</div>
          <div className="mono-display font-extrabold text-[clamp(2rem,7vw,5.5rem)] leading-none tx-grad tx-glow">21 APRIL 2014</div>
          <div className="mt-5 text-[11px] tracking-[0.35em] text-rose-300">❤ THE MOST SACRED MILESTONE — SEALED IN THE AYUSH SHRIVASTAVA LEDGER ❤</div>
          <div className="mt-3 text-[9px] tracking-[0.3em] text-slate-500">0x04212014 :: hash.verify(heart) == TRUE :: click to reseal</div>
        </div>
      </div>
    </div>
  );
}
