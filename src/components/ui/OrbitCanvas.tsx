import { useEffect, useRef, useState, useCallback } from "react";
import TextScramble from "./TextScramble";

export default function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const lastRef   = useRef(performance.now());
  const tRef      = useRef(0);
  const crafts    = useRef([
    { color: "#3cc6ff", r: 0.22, speed:  0.60, angle: 0.3 },
    { color: "#ffd84d", r: 0.32, speed: -0.75, angle: 2.2 },
    { color: "#ff4a5a", r: 0.42, speed:  0.95, angle: 4.1 },
  ]);
  const [ignite, setIgnite] = useState(false);
  const activate = useCallback(() => setIgnite(true), []);

  useEffect(() => {
    const cvs = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S   = 400;          // Larger logical size for better resolution
    cvs.width  = S * dpr;
    cvs.height = S * dpr;
    cvs.style.width  = S + "px";
    cvs.style.height = S + "px";
    const ctx  = cvs.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const C = S / 2;

    const arc = (r: number, color: string, a: number, dash: number[] = [], lw = 1) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${color},${a})`;
      ctx.lineWidth   = lw;
      ctx.setLineDash(dash);
      ctx.beginPath(); ctx.arc(C, C, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    };

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      tRef.current += dt;
      const t = tRef.current;
      ctx.clearRect(0, 0, S, S);

      /* Heartbeat logic */
      const cycle = t % 1.6;
      let heartScale = 1.0;
      let heartAlpha = 0;
      if (cycle < 0.15) {
        const p = cycle / 0.15;
        heartScale = 1.0 + Math.sin(p * Math.PI) * 0.07;
        heartAlpha = Math.sin(p * Math.PI);
      } else if (cycle > 0.25 && cycle < 0.5) {
        const p = (cycle - 0.25) / 0.25;
        heartScale = 1.0 + Math.sin(p * Math.PI) * 0.13;
        heartAlpha = Math.sin(p * Math.PI);
      }

      /* Ambient center glow */
      const g = ctx.createRadialGradient(C, C, 0, C, C, S * 0.2 * heartScale);
      g.addColorStop(0, ignite ? "rgba(246,224,179,0.15)" : `rgba(246,224,179,${0.08 + heartAlpha * 0.06})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

      /* Rings */
      arc(S * 0.44, "0,255,157", 0.3, [], 1);
      arc(S * 0.32, "0,255,157", 0.12, [4, 6], 0.8);
      
      /* Sigil Circle */
      ctx.save();
      const sigilR = S * 0.18 * heartScale;
      const sf = ctx.createRadialGradient(C, C, 0, C, C, sigilR);
      sf.addColorStop(0, ignite ? "rgba(246,224,179,0.2)" : `rgba(246,224,179,${0.1 + heartAlpha * 0.05})`);
      sf.addColorStop(0.8, "rgba(8,12,16,0.95)");
      sf.addColorStop(1, "rgba(4,6,8,1)");
      ctx.fillStyle = sf;
      ctx.beginPath(); ctx.arc(C, C, sigilR, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = `rgba(246,224,179,${0.6 + heartAlpha * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(C, C, sigilR, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      /* Ticks */
      ctx.save(); ctx.strokeStyle = "rgba(246,224,179,0.4)"; ctx.lineWidth = 1.2;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const isMain = i % 6 === 0;
        const r0 = S * 0.44 + 4;
        const r1 = r0 - (isMain ? 10 : 5);
        ctx.beginPath();
        ctx.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
        ctx.lineTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.restore();

      /* Satellites */
      const spd = ignite ? 2.5 : 1.0;
      for (const c of crafts.current) {
        c.angle += c.speed * spd * dt;
        const rx = C + Math.cos(c.angle) * c.r * S;
        const ry = C + Math.sin(c.angle) * c.r * S;

        if (ignite) {
          const tx = -Math.sin(c.angle) * Math.sign(c.speed);
          const ty =  Math.cos(c.angle) * Math.sign(c.speed);
          const fl = 20, fw = 5;
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(Math.atan2(ty, tx));
          const gf = ctx.createLinearGradient(-fl, 0, 0, 0);
          gf.addColorStop(0, "rgba(0,0,0,0)");
          gf.addColorStop(0.5, c.color + "aa");
          gf.addColorStop(1, "rgba(255,255,255,0.8)");
          ctx.fillStyle = gf;
          ctx.beginPath();
          ctx.moveTo(-fl, 0);
          ctx.quadraticCurveTo(-fl * 0.4, -fw, 0, -0.5);
          ctx.quadraticCurveTo(1, 0, 0, 0.5);
          ctx.quadraticCurveTo(-fl * 0.4,  fw, -fl, 0);
          ctx.fill(); ctx.restore();
        }

        const gh = ctx.createRadialGradient(rx, ry, 0, rx, ry, 8);
        gh.addColorStop(0, c.color + "66"); gh.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gh; ctx.beginPath(); ctx.arc(rx, ry, 8, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = ignite ? 15 : 6;
        ctx.beginPath(); ctx.arc(rx, ry, ignite ? 4 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      /* AS Text */
      ctx.save();
      const fontSize = (ignite ? 48 : 42) * heartScale;
      ctx.font = `900 ${fontSize}px 'Cinzel', serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = ignite ? "#f6e0b3" : "rgba(246,224,179,0.95)";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 10;
      ctx.fillText("AS", C, C + 2);
      ctx.restore();

      /* Pressure Wave */
      if (cycle < 0.6) {
        const wp = ((cycle * 1.4) % 1.0);
        ctx.save();
        ctx.strokeStyle = `rgba(246,224,179,${(1 - wp) * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(C, C, wp * S * 0.48, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ignite]);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative cursor-pointer" onClick={activate} onPointerDown={activate}
           style={{ width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      <div className="text-center mt-2">
        <div className="text-base font-bold" style={{ color: "var(--c1)", letterSpacing: "0.06em", fontFamily: "var(--mono)" }}>
          <TextScramble text="AYUSH SHRIVASTAVA" trigger speed={18} />
        </div>
        <div className="label mt-2" style={{ letterSpacing: "0.35em", color: "var(--dim)" }}>
          MIND&nbsp;·&nbsp;BODY&nbsp;·&nbsp;TECHNOLOGY
        </div>
        {!ignite && (
          <div className="label mt-2 animate-pulse" style={{ fontSize: 9, color: "var(--gold)", opacity: 0.5, letterSpacing: "0.35em" }}>
            TAP CORE TO IGNITE
          </div>
        )}
      </div>
    </div>
  );
}
