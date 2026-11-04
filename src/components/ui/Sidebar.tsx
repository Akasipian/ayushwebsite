import { useEffect, useState, useRef } from "react";
import {
  Home, Trophy, Code2, Route, Share2, User, Mail,
  Camera, Play, Activity, Clock, Database
} from "lucide-react";
import { vibe } from "../../lib/uniforms";
import { ID, SOCIALS } from "../../lib/data";

export const NAV_ITEMS = [
  { id: "home",         label: "Home",             icon: Home },
  { id: "achievements", label: "Achievements",     icon: Trophy },
  { id: "projects",     label: "Projects",         icon: Database },
  { id: "skills",       label: "Skills & Matrix",  icon: Code2 },
  { id: "journey",      label: "Journey",          icon: Route },
  { id: "social",       label: "Social",           icon: Share2 },
  { id: "about",        label: "About",            icon: User },
  { id: "signal",       label: "Contact",          icon: Mail },
];

export default function Sidebar({ onCloseDrawer }: { onCloseDrawer: () => void }) {
  const [active, setActive] = useState("home");
  const [uptime, setUptime] = useState(0);
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const sc = document.getElementById("scroll-container");
    const onScroll = () => {
      if (!sc) return;
      const y = sc.scrollTop + 140;
      let cur = "home";
      for (const n of NAV_ITEMS) {
        const el = document.getElementById(n.id);
        if (el && el.offsetTop <= y) cur = n.id;
      }
      setActive(cur);
    };
    sc?.addEventListener("scroll", onScroll, { passive: true });

    // Uptime & FPS Telemetry
    const ticker = setInterval(() => setUptime(p => p + 1), 1000);
    let raf = 0;
    const fpsLoop = () => {
      raf = requestAnimationFrame(fpsLoop);
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
    };
    raf = requestAnimationFrame(fpsLoop);

    return () => {
      sc?.removeEventListener("scroll", onScroll);
      clearInterval(ticker);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    vibe(8);
    const sc = document.getElementById("scroll-container");
    const el = document.getElementById(id);
    if (sc && el) sc.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: "smooth" });
    onCloseDrawer();
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <aside id="site-sidebar" className="sb">
      {/* ── Crest ── */}
      <div className="flex items-center gap-4 px-4 h-[72px] shrink-0 border-b border-white/[0.05]">
        <div className="relative w-10 h-10 shrink-0 group">
          <div className="absolute inset-0 rounded-lg bg-gold-grad spin-slow opacity-20 blur-sm" />
          <div className="absolute inset-0 rounded-lg border border-[var(--gold)]/30 spin-rev" />
          <button
            onClick={() => go("home")}
            className="absolute inset-[2px] grid place-items-center rounded bg-[#05070a] border border-white/5"
          >
            <span className="imperial text-[var(--gold)] text-[10px] font-black">AS</span>
          </button>
        </div>
        <div className="coll-hide">
          <div className="algerian-gold text-[15px] leading-none whitespace-nowrap">A. SHRIVASTAVA</div>
          <div className="label mt-1.5 flex items-center gap-2 opacity-50" style={{ fontSize: 7 }}>
            <span className="w-1 h-1 rounded-full bg-[var(--c1)] animate-pulse" />
            UPLINK ACTIVE
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <div className="label-gold px-5 mb-3 coll-hide font-black opacity-60" style={{ letterSpacing: "0.45em", fontSize: 7 }}>TERMINAL_NAV</div>
        <nav>
          {NAV_ITEMS.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`sb-item w-[calc(100%-20px)] ${active === n.id ? "active" : ""}`}
                aria-current={active === n.id ? "page" : undefined}
              >
                <Icon className="ic" size={15} />
                <span className="coll-hide text-[12px] font-medium">{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Telemetry HUD ── */}
        <div className="mt-8 coll-hide px-5">
          <div className="label-gold mb-4 font-black opacity-60" style={{ fontSize: 7, letterSpacing: '0.4em' }}>TELEMETRY_LIVE</div>
          <div className="space-y-2">
            {[
              { label: "Uptime", val: formatTime(uptime), icon: Clock },
              { label: "Frame rate", val: `${fps} FPS`, icon: Activity },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <t.icon size={11} className="text-[var(--gold)] opacity-50" />
                  <span className="label opacity-50" style={{ fontSize: 7 }}>{t.label}</span>
                </div>
                <span className="tnum text-[9px] font-bold text-white">{t.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Connect ── */}
      <div className="shrink-0 border-t border-white/[0.05] p-5 coll-hide bg-black/20">
        <div className="label-gold mb-3 font-black opacity-60" style={{ fontSize: 7 }}>DIRECT_TX</div>
        <div className="space-y-1">
          <a href={`mailto:${ID.email}`} className="block text-[10px] text-slate-400 hover:text-white transition truncate tnum">{ID.email}</a>
          <span className="block text-[10px] text-slate-400 tnum mt-0.5">{ID.phone}</span>
        </div>
        <div className="flex gap-2 mt-4">
          {[
            { ic: Camera, s: SOCIALS.find((x) => x.id === "instagram")! },
            { ic: Play,   s: SOCIALS.find((x) => x.id === "youtube")! },
          ].map(({ ic: Icon, s }) => (
            <a
              key={s.id} href={s.url} target="_blank" rel="noreferrer"
              className="w-8 h-8 grid place-items-center rounded border border-white/5 text-[var(--dim)] hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all bg-white/[0.02]"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
