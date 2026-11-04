import { useEffect, useRef, useState } from "react";

/** Custom spring-physics magnetic cursor with morph states */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<"default" | "hover" | "click" | "text">("default");

  useEffect(() => {
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    let dx = rx, dy = ry;
    let vx = 0, vy = 0;
    let raf = 0;
    let pressed = false;

    const SPRING = 0.14, DAMPING = 0.78;

    const onMove = (e: PointerEvent) => {
      rx = e.clientX; ry = e.clientY;
      if (!pressed) setVariant(isInteractive(e.target) ? "hover" : "default");
    };

    const onDown = () => { pressed = true; setVariant("click"); };
    const onUp = () => {
      pressed = false;
      setVariant(isInteractive(document.elementFromPoint(rx, ry)) ? "hover" : "default");
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      vx = (vx + (rx - dx) * SPRING) * DAMPING;
      vy = (vy + (ry - dy) * SPRING) * DAMPING;
      dx += vx; dy += vy;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${rx - 4}px, ${ry - 4}px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${dx - 20}px, ${dy - 20}px, 0)`;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const isHover = variant === "hover";
  const isClick = variant === "click";

  return (
    <>
      {/* Sharp dot — exact cursor position */}
      <div
        ref={dot}
        className="fixed top-0 left-0 z-[200] pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: "var(--gold)",
            boxShadow: "0 0 8px var(--gold), 0 0 20px rgba(246,224,179,0.5)",
            transform: isClick ? "scale(0.5)" : isHover ? "scale(1.5)" : "scale(1)",
            transition: "transform 0.1s, background 0.2s",
          }}
        />
      </div>

      {/* Spring-lagging ring */}
      <div
        ref={ring}
        className="fixed top-0 left-0 z-[199] pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <div
          style={{
            width: isHover ? 56 : isClick ? 24 : 40,
            height: isHover ? 56 : isClick ? 24 : 40,
            border: `1px solid ${isHover ? "var(--gold)" : "rgba(246,224,179,0.35)"}`,
            borderRadius: "50%",
            transition: "width 0.35s cubic-bezier(.22,1,.36,1), height 0.35s cubic-bezier(.22,1,.36,1), border-color 0.2s",
            boxShadow: isHover ? "0 0 20px -5px rgba(246,224,179,0.5)" : "none",
            backdropFilter: isHover ? "blur(2px)" : "none",
          }}
        />
      </div>
    </>
  );
}

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("button, a, [role='button']"));
}
