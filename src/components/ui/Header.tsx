import { Mail, Menu, X } from "lucide-react";
import { vibe } from "../../lib/uniforms";

const LINKS = [
  { id: "home",         label: "Home" },
  { id: "achievements", label: "Achievements" },
  { id: "skills",       label: "Skills" },
];

export default function Header({
  drawerOpen,
  onToggleDrawer,
}: {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}) {
  const go = (id: string) => {
    vibe(8);
    const sc = document.getElementById("scroll-container");
    const el = document.getElementById(id);
    if (sc && el) sc.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: "smooth" });
  };

  return (
    <header className="hd flex items-center gap-4 px-4 sm:px-6">
      {/* mobile hamburger */}
      <button
        onClick={onToggleDrawer}
        className="lg:hidden w-9 h-9 grid place-items-center rounded-md border border-white/10 text-[var(--c1)]"
        aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={drawerOpen}
        aria-controls="site-sidebar"
      >
        {drawerOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* gold Algerian name — top left */}
      <button onClick={() => go("home")} className="algerian-gold text-[15px] sm:text-[17px] leading-none hover:opacity-80 transition-opacity whitespace-nowrap">
        AYUSH SHRIVASTAVA
      </button>

      <span className="flex-1" />

      {/* moto — center */}
      <div className="hidden lg:block carbon-text text-[9px] tracking-[0.35em] uppercase text-center px-6" style={{ color: "var(--gold)", opacity: 0.65 }}>
        Let's Build.. <span style={{ color: "var(--c1)" }}>Let's Conquer...</span>
      </div>

      <span className="flex-1" />

      {/* nav links */}
      <nav className="hidden md:flex items-center gap-6">
        {LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => go(l.id)}
            onPointerEnter={() => vibe(4)}
            className="navlink text-[12px] text-slate-400 hover:text-white transition-colors"
          >
            {l.label}
          </button>
        ))}
      </nav>

      <span className="hidden md:block w-px h-5 bg-white/10" />

      <button
        onClick={() => go("signal")}
        onPointerEnter={() => vibe(5)}
        className="btn-gold flex items-center gap-2 px-5 sm:px-6 py-2.5 text-[12px] shadow-lg shadow-black/20"
      >
        <Mail size={14} />
        Contact
      </button>
    </header>
  );
}
