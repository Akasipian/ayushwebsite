import { useEffect, useState } from "react";
import Experience from "./components/three/Experience";
import Sidebar from "./components/ui/Sidebar";
import Header from "./components/ui/Header";
import Sections from "./components/ui/Sections";
import Cursor from "./components/ui/Cursor";
import ScrollProgress from "./components/ui/ScrollProgress";
import NoiseOverlay from "./components/ui/NoiseOverlay";
// Marquee used inside Sections
import { useStore } from "./lib/store";
import { bindPointer, startGlitchEngine } from "./lib/uniforms";

export default function App() {
  const { phase, setMode } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [isExitingIntro, setIsExitingIntro] = useState(false);

  useEffect(() => {
    const unbind    = bindPointer();
    const stopGlitch = startGlitchEngine();
    document.body.classList.add("locked");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer(false);
        if (useStore.getState().mode !== "sovereign") setMode("sovereign");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { unbind(); stopGlitch(); window.removeEventListener("keydown", onKey); };
  }, [setMode]);

  const live = phase === "live";

  return (
    <div className="scanlines visor">
      {/* Global overlays */}
      <NoiseOverlay />
      <Cursor />
      {live && <ScrollProgress />}

      {/* 5D matrix backdrop */}
      <Experience />

      {/* ═══ INTRO SPLASH ════════════════════════════════════════════════ */}
      {phase === "intro" && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center cursor-pointer select-none"
          style={{ pointerEvents: "auto" }}
          role="button"
          tabIndex={0}
          aria-label="Enter the website"
          onPointerDown={() => setIsExitingIntro(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExitingIntro(true);
            }
          }}
        >
          {/* full blackout — no white light leaks, pure obsidian void */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isExitingIntro ? 0 : 1,
              background:
                "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.97) 100%)",
            }}
          />

          {/* carbon-fibre name + moto block — vanishes INSTANTLY on click */}
          <div className={`relative text-center px-4 z-10 transition-none ${isExitingIntro ? "hidden" : "block"}`}>
            {/* kicker */}
            <div
              className="text-[9px] sm:text-[10px] tracking-[0.7em] uppercase mb-8"
              style={{
                color: "var(--c1)",
                opacity: 0,
                animation: "fadeInUp 1s ease 0.2s forwards",
                fontFamily: "var(--mono)",
              }}
            >
              Ayush Shrivastava &nbsp;·&nbsp; Personal HQ
            </div>

            {/* ▸ CARBON FIBRE NAME — Fluid Scaling & Multi-line Support for Mobile */}
            <div
              style={{
                opacity: 0,
                animation: "fadeInUp 1.3s ease 0.5s forwards",
              }}
            >
              <h1
                className="carbon-display-hero"
                style={{
                  fontSize: "clamp(2.4rem, 10vw, 9rem)",
                  lineHeight: 1,
                  wordBreak: "break-word",
                  maxWidth: "92vw",
                  margin: "0 auto",
                }}
              >
                Ayush Shrivastava
              </h1>
            </div>

            {/* thin gold rule */}
            <div
              className="mx-auto mt-6 mb-6"
              style={{
                width: "clamp(60px,22vw,140px)",
                height: 1,
                background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                opacity: 0,
                animation: "fadeInUp 1s ease 1s forwards",
              }}
            />

            {/* moto */}
            <div
              className="carbon-text uppercase text-center"
              style={{
                fontSize: "clamp(0.65rem, 2.4vw, 1.05rem)",
                letterSpacing: "0.48em",
                color: "var(--gold)",
                opacity: 0,
                animation: "fadeInUp 1.2s ease 1.2s forwards",
              }}
            >
              Let's Build&nbsp;&nbsp;<span style={{ color: "var(--c1)" }}>Let's Conquer</span>
            </div>

            {/* click cue */}
            <div
              className="mt-12 flex flex-col items-center gap-3"
              style={{ opacity: 0, animation: "fadeInUp 1s ease 1.8s forwards" }}
            >
              <span
                className="text-[9px] tracking-[0.55em] uppercase"
                style={{ color: "var(--dim)" }}
              >
                Click anywhere to enter
              </span>
              {/* pulsing circle */}
              <span
                className="w-10 h-10 rounded-full border-2 grid place-items-center"
                style={{ borderColor: "rgba(246,224,179,0.35)" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "var(--gold)",
                    boxShadow: "0 0 14px var(--gold)",
                    animation: "pulse-dot 2s ease-out infinite",
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DASHBOARD SHELL ═════════════════════════════════════════════ */}
      <div className="app-shell" data-drawer={drawer} data-live={live}>
        {/* mobile drawer backdrop */}
        {drawer && (
          <div
            className="fixed inset-0 bg-black/70 z-[58] lg:hidden"
            onClick={() => setDrawer(false)}
          />
        )}

        <Sidebar onCloseDrawer={() => setDrawer(false)} />
        <Header drawerOpen={drawer} onToggleDrawer={() => setDrawer((v) => !v)} />
        <div id="scroll-container" className={`scrollzone ${live ? "" : "locked"}`}>
          <Sections />
        </div>
      </div>
    </div>
  );
}
