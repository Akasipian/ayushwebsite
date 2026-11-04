import { useEffect, useRef } from "react";

const ITEMS = [
  "AYUSH SHRIVASTAVA",
  "⚡ LET'S BUILD",
  "LET'S CONQUER ⚔",
  "MARTIAL ARTIST",
  "BLACK BELT 🥋",
  "CYBER SECURITY RESEARCHER",
  "INDIA",
  "PYTHON · HTML · CSS",
  "NATIONAL CHAMPION 🏆",
  "MIND · BODY · TECH",
];

export default function Marquee({ direction = 1 }: { direction?: 1 | -1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const raf = useRef(0);
  const speed = 0.55;

  useEffect(() => {
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      if (!ref.current) return;
      x.current -= speed * direction;
      const half = ref.current.scrollWidth / 2;
      if (Math.abs(x.current) >= half) x.current = 0;
      ref.current.style.transform = `translate3d(${x.current}px, 0, 0)`;
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [direction]);

  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden w-full">
      <div ref={ref} className="flex items-center gap-0 whitespace-nowrap will-change-transform" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-0">
            <span
              className="px-6 py-3 text-[11px] font-bold tracking-[0.35em] uppercase"
              style={{ color: i % 3 === 0 ? "var(--gold)" : i % 3 === 1 ? "var(--c1)" : "var(--dim)" }}
            >
              {item}
            </span>
            <span className="text-[var(--dim)] opacity-30 text-xs">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
