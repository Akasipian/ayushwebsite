import { useEffect, useRef } from "react";

/** Fixed top scroll-progress bar + section dot nav */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  const SECTIONS = [
    { id: "home", label: "Home" },
    { id: "achievements", label: "Achievements" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "journey", label: "Journey" },
    { id: "social", label: "Social" },
    { id: "about", label: "About" },
    { id: "signal", label: "Contact" },
  ];

  useEffect(() => {
    const sc = document.getElementById("scroll-container");
    if (!sc) return;

    const update = () => {
      const max = Math.max(1, sc.scrollHeight - sc.clientHeight);
      const pct = sc.scrollTop / max;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${pct})`;
      }

      // Active dot
      const y = sc.scrollTop + 200;
      let active = "home";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) active = s.id;
      }
      dotsRef.current?.querySelectorAll("[data-section]").forEach(d => {
        const isActive = d.getAttribute("data-section") === active;
        (d as HTMLElement).style.width = isActive ? "20px" : "6px";
        (d as HTMLElement).style.opacity = isActive ? "1" : "0.4";
        (d as HTMLElement).style.background = isActive ? "var(--gold)" : "var(--dim)";
      });
    };

    sc.addEventListener("scroll", update, { passive: true });
    update();
    return () => sc.removeEventListener("scroll", update);
  }, []);

  const go = (id: string) => {
    const sc = document.getElementById("scroll-container");
    const el = document.getElementById(id);
    if (sc && el) sc.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: "smooth" });
  };

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[150] h-[2px] bg-white/5 pointer-events-none">
        <div
          ref={barRef}
          className="h-full origin-left"
          style={{
            background: "linear-gradient(90deg, var(--c1), var(--gold), var(--c2))",
            transition: "transform 0.05s linear",
            boxShadow: "0 0 10px var(--gold)",
          }}
        />
      </div>

      {/* Right-side section dot navigator */}
      <div
        ref={dotsRef}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[150] hidden xl:flex flex-col gap-3 pointer-events-auto"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            data-section={s.id}
            onClick={() => go(s.id)}
            title={s.label}
            className="group relative flex items-center justify-end gap-2"
          >
            {/* label on hover */}
            <span
              className="label opacity-0 group-hover:opacity-100 transition-all duration-200 absolute right-8 whitespace-nowrap bg-black/70 px-2 py-1 rounded"
              style={{ color: "var(--gold)", fontSize: 9, letterSpacing: "0.2em" }}
            >
              {s.label}
            </span>
            <div
              data-section={s.id}
              style={{
                width: 6, height: 6,
                borderRadius: 99,
                background: "var(--dim)",
                opacity: 0.4,
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
                boxShadow: "0 0 8px transparent",
              }}
            />
          </button>
        ))}
      </div>
    </>
  );
}
