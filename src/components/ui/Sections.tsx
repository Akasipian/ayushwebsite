import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Code2, Briefcase, AtSign, Camera, Play, Rocket, ArrowUpRight, Mail, Send,
  Trophy, Medal, Shield, Crown, Dumbbell, Terminal, GraduationCap, MapPin,
  CalendarDays, Cpu, Sparkles, Target, Zap, Eye, Star,
  ChevronRight, ExternalLink, Award, Flame, Box
} from "lucide-react";
import { ID, SKILLS, TIMELINE, SOCIALS, PROJECTS } from "../../lib/data";
import { G, vibe } from "../../lib/uniforms";
import { useStore } from "../../lib/store";
import { Brackets } from "./Ornaments";
import MarqueeBand from "./Marquee";
import TextScramble from "./TextScramble";
import OrbitCanvas from "./OrbitCanvas";

gsap.registerPlugin(ScrollTrigger);

const SOCIAL_ICONS: Record<string, any> = { github: Code2, linkedin: Briefcase, x: AtSign, instagram: Camera, youtube: Play, devpost: Rocket };

/* =================== ANIMATED COUNTER =================== */
function Counter({ to, suffix = "", duration = 1.2 }: { to: number; suffix?: string; duration?: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const raf = useRef(0);
  useEffect(() => {
    if (started.current) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const loop = (t: number) => {
          const p = Math.min((t - t0) / (duration * 1000), 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);
        obs.disconnect();
      }
    }, { root: document.getElementById("scroll-container"), threshold: 0.3 });
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [to, duration]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

/* =================== SECTION HEADER =================== */
function Hdr({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="rv mb-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-[3px] w-16 bg-gold-grad rounded-full shadow-[0_0_12px_rgba(246,224,179,0.3)]" />
        <span className="label font-black" style={{ color: "var(--gold)", letterSpacing: "0.5em", fontSize: "10px" }}>{kicker}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="imperial text-white uppercase leading-tight text-[clamp(1.8rem,4vw,3.2rem)] font-bold tracking-wider"
            style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}>
          {title}
        </h2>
        {sub && <span className="label-gold border-l-2 border-[var(--gold)]/20 pl-5 py-2 italic opacity-80">{sub}</span>}
      </div>
      <div className="rule-gold mt-6 opacity-30" />
    </div>
  );
}

/* =================== TYPING TEXT =================== */
function TypeWriter({ text, speed = 35 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let i = 0;
        interval.current = setInterval(() => {
          i++;
          setShown(i);
          if (i >= text.length && interval.current) {
            clearInterval(interval.current);
            interval.current = null;
          }
        }, speed);
        obs.disconnect();
      }
    }, { root: document.getElementById("scroll-container"), threshold: 0.3 });
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (interval.current) clearInterval(interval.current);
      interval.current = null;
    };
  }, [text, speed]);
  return <span ref={ref}>{text.slice(0, shown)}<span className="caret text-[var(--c1)]">█</span></span>;
}

/* =================== HERO ORBIT — canvas version =================== */
function OrbitHero() {
  return <OrbitCanvas />;
}

/* =================== HERO =================== */
function Hero() {
  const phase = useStore((s) => s.phase);
  const live = phase === "live";
  const go = useCallback((id: string) => {
    const sc = document.getElementById("scroll-container");
    const el = document.getElementById(id);
    if (sc && el) sc.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: "smooth" });
    vibe(10);
  }, []);
  return (
    <section id="home" className={`transition-all duration-700 ${live ? "opacity-100" : "opacity-0"}`}>
      <div className="panel relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(246,224,179,.05), transparent 65%)" }} />
        <div className="pointer-events-none absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,255,157,.04), transparent 65%)" }} />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 p-4 sm:p-10 lg:p-14 items-center">
          <div className="rv flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 border border-[var(--gold)]/30 rounded-full px-3 py-1.5 bg-[var(--gold)]/5">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--gold)" }} />
              <span className="label font-bold" style={{ letterSpacing: "0.2em", color: "var(--gold)", fontSize: 9 }}>IDENTITY ONLINE</span>
            </span>

            <h1 className="mt-5 sm:mt-8 text-[clamp(1.35rem,8vw,6rem)] leading-[0.96] font-black" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.03em" }}>
              <span className="tx-gold">
                <TextScramble text="Let's Build.." trigger={live} speed={25} />
              </span>
              <br />
              <span className="text-white">Let's Conquer<span className="tx-gold">...</span></span>
            </h1>

            <p className="mt-5 sm:mt-7 max-w-lg text-[13px] sm:text-[14px] leading-7 text-[var(--dim)]">
              Black-belt martial artist, national champion, and technology builder crafting discipline into digital architecture.
            </p>

            <div className="mt-6 sm:mt-9 flex flex-wrap items-center gap-2 sm:gap-3 pointer-events-auto">
              <button onClick={() => go("signal")} className="btn-gold flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 text-[12px] sm:text-[13px] font-black group">
                <Mail size={15} /> Connect <ChevronRight size={13} className="hidden sm:block group-hover:translate-x-1 transition-transform" />
              </button>
              <a href={SOCIALS.find((s) => s.id === "youtube")?.url} target="_blank" rel="noreferrer" className="btn-ghost flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 text-[12px] sm:text-[13px] group">
                <Play size={13} /> YouTube
              </a>
            </div>

            <div className="mt-8 sm:mt-12 flex flex-wrap gap-5 sm:gap-8">
              {[
                { icon: Flame, v: 2015, s: "", l: "Started Karate" },
                { icon: Trophy, v: 2, s: "×", l: "National Titles" },
                { icon: Star, v: 83, s: "%", l: "Class 10" },
                { icon: Zap, v: 6, s: "", l: "Tech Stacks" },
              ].map(({ icon: Ic, v, s, l }) => (
                <div key={l} className="flex items-center gap-3 group">
                  <Ic size={18} style={{ color: "var(--gold)", opacity: 0.6 }} className="group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-white text-[18px] sm:text-[20px] font-black tnum leading-none"><Counter to={v} suffix={s} /></div>
                    <div className="label mt-1 opacity-50" style={{ fontSize: 7 }}>{l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rv hidden lg:flex items-center justify-center pr-4">
            <OrbitHero />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================== ACHIEVEMENTS =================== */
function Achievements() {
  const items = [
    { icon: Shield, tone: "var(--c1)", t: "Black Belt Achievement", d: "Started: 16 Jun 2015. Black Belt: 17 Feb 2023. A lifelong path of learning and discipline. Undefeated on the mat.", tag: "MARTIAL", num: "01" },
    { icon: Trophy, tone: "var(--gold)", t: "Two-Time National Champion", d: "Karate titles at national level — speed, timing, and unbreakable composure.", tag: "TITLE", num: "02" },
    { icon: Crown, tone: "var(--c2)", t: "Campus Sports Head", d: "Crowned school legend — the ultimate nunchucks virtuoso and team leader.", tag: "LEGEND", num: "03" },
    { icon: Medal, tone: "var(--c1)", t: "Class 10 Conquest — 83%", d: "Boards conquered while mastering HTML & CSS on the side. First builds shipped.", tag: "2024", num: "04" },
    { icon: GraduationCap, tone: "var(--c2)", t: "Class 12 — PCM + IP, 69%", d: "Physics, Chemistry, Maths, Informatics Practices. Python and SQL absorbed.", tag: "2026", num: "05" },
    { icon: Terminal, tone: "var(--c3)", t: "Cyber Operations", d: "Ethical hacking, recon & hardening alongside Python, SQL, React & WebGL builds.", tag: "ACTIVE", num: "06" },
  ];
  return (
    <section id="achievements" className="mt-12">
      <Hdr kicker="02 · RECORD" title="Hall of Conquests" sub="UNDISPUTED ENTRIES" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ icon: Icon, tone, t, d, tag, num }) => (
          <div key={t} className="rv panel panel-hover p-6 group relative overflow-hidden" data-num={num}>
            {/* ghost number */}
            <span className="absolute -right-2 -top-3 text-[4.5rem] font-black leading-none opacity-[0.04] select-none" style={{ fontFamily: "Inter" }}>{num}</span>
            <div className="flex items-center justify-between relative">
              <span className="w-11 h-11 grid place-items-center rounded-lg border" style={{ borderColor: `color-mix(in srgb, ${tone} 35%, transparent)`, color: tone, background: `color-mix(in srgb, ${tone} 8%, transparent)` }}>
                <Icon size={18} />
              </span>
              <span className="label font-bold" style={{ color: tone }}>{tag}</span>
            </div>
            <div className="text-white text-[15px] font-bold mt-5 leading-snug" style={{ fontFamily: "Inter" }}>{t}</div>
            <p className="text-[11.5px] leading-6 text-[var(--dim)] mt-2">{d}</p>
            {/* hover bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: tone, boxShadow: `0 0 12px ${tone}` }} />
            {/* hover icon rotate */}
            <style>{`.group:hover .achievement-icon-${num} { transform: rotate(6deg) scale(1.08); }`}</style>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================== SKILLS =================== */
function Skills() {
  const skillId = useStore((s) => s.skillId);
  const setSkill = useStore((s) => s.setSkill);
  const active = SKILLS.find((s) => s.id === skillId) || SKILLS[0];
  return (
    <section id="skills" className="mt-12">
      <Hdr kicker="03 · NEXUS CORE" title="Skills & Projects" sub="LIVE 3D CORE MORPHS BEHIND THIS PANEL" />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-2.5 rv pointer-events-auto">
          {SKILLS.map((s) => {
            const on = skillId === s.id;
            return (
              <button key={s.id} onClick={() => { setSkill(s.id); vibe(12); }}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-lg border transition-all group ${on ? "panel" : "panel panel-hover"}`}
                style={{ borderColor: on ? `color-mix(in srgb, ${s.palette[0]} 45%, transparent)` : "rgba(255,255,255,.07)" }}>
                <span className="relative w-11 h-11 shrink-0 grid place-items-center">
                  <svg viewBox="0 0 40 40" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
                    <circle cx="20" cy="20" r="17" fill="none" stroke={s.palette[0]} strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 17} strokeDashoffset={2 * Math.PI * 17 * (1 - s.mastery / 100)}
                      style={{ filter: `drop-shadow(0 0 4px ${s.palette[0]})`, transition: "stroke-dashoffset .6s cubic-bezier(0,0.55,0.45,1)" }} />
                  </svg>
                  <span className="text-[9px] font-black tnum" style={{ color: on ? s.palette[0] : "var(--dim)" }}>{s.mastery}</span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-white">{s.label}</span>
                  <span className="block label mt-0.5">{s.era}</span>
                </span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" style={{ color: on ? s.palette[0] : "var(--dim)" }} />
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 panel p-7 rv pointer-events-auto relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full" style={{ background: `radial-gradient(circle, ${active.palette[0]}10, transparent 70%)` }} />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <Eye size={13} style={{ color: active.palette[0] }} />
              <span className="label font-bold" style={{ color: active.palette[0] }}>ACTIVE · {active.short}</span>
            </div>
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: active.palette[0] }} />
          </div>
          <div className="text-white uppercase text-2xl font-black mt-3" style={{ fontFamily: "Inter" }}>{active.label}</div>
          <div className="label mt-1.5">{active.era}</div>
          <div className="h-px bg-white/[0.07] my-5" />
          <p className="text-[13px] leading-7 text-slate-300/90">{active.detail}</p>

          <div className="mt-6">
            <div className="flex justify-between label mb-2">
              <span>MASTERY INDEX</span>
              <span className="tnum font-bold" style={{ color: active.palette[0] }}><Counter to={active.mastery} suffix="%" /></span>
            </div>
            <div className="h-[5px] bg-white/[0.08] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${active.mastery}%`, background: `linear-gradient(90deg, ${active.palette[0]}, ${active.palette[1]})`, boxShadow: `0 0 12px ${active.palette[0]}` }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 border border-white/[0.08] rounded-lg overflow-hidden">
            {[["AMP", active.amp.toFixed(2)], ["TWIST", active.twist.toFixed(1)], ["STATUS", "LOCKED"]].map(([k, v], i) => (
              <div key={k} className={`py-3.5 text-center ${i < 2 ? "border-r border-white/[0.08]" : ""}`}>
                <div className="label">{k}</div>
                <div className="text-[13px] font-bold tnum mt-1" style={{ color: active.palette[0] }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["HTML5", "CSS3", "Python", "SQL", "Recon", "Hardening", "Automation", "WebGL", "React"].map((t) => (
              <span key={t} className="text-[9px] tracking-[0.22em] border border-white/10 rounded-full px-3 py-1.5 text-[var(--dim)] hover:text-[var(--c1)] hover:border-[var(--c1)]/40 transition cursor-default">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================== JOURNEY =================== */
function Journey() {
  return (
    <section id="journey" className="mt-12">
      <Hdr kicker="04 · CHRONO-STREAM" title="The Journey" sub="2014 → 2026" />
      <div className="relative">
        <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: "linear-gradient(to bottom, transparent, var(--c1) 15%, var(--gold) 50%, var(--c2) 85%, transparent)", opacity: 0.35 }} />
        {TIMELINE.map((m, i) => {
          const right = i % 2 === 1;
          return (
            <div key={m.id} className="rv relative md:grid md:grid-cols-2 md:gap-10 py-4">
              {/* node marker */}
              <span className="absolute left-[9px] md:left-1/2 top-9 -translate-x-1/2 z-10">
                <span className="block w-3.5 h-3.5 rotate-45" style={{ background: i === 1 ? "var(--c3)" : "var(--gold)", boxShadow: `0 0 14px ${i === 1 ? "var(--c3)" : "var(--gold)"}` }} />
              </span>
              {/* counter badge */}
              <span className="absolute left-[3px] md:left-1/2 top-[52px] -translate-x-1/2 z-10 text-[8px] font-black tnum text-[var(--dim)]">{String(i + 1).padStart(2, "0")}</span>
              <div className={`pl-10 md:pl-0 ${right ? "md:col-start-2 md:pl-10" : "md:pr-10 md:text-right"}`}>
                <article className="panel panel-hover p-5 sm:p-6 pointer-events-auto group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ background: "linear-gradient(90deg, var(--gold), var(--c1))" }} />
                  <div className="flex items-center gap-3 mb-3" style={{ justifyContent: right ? "flex-start" : undefined }}>
                    <span className="label px-2.5 py-1.5 border rounded-full font-bold" style={{ borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)", color: "var(--gold)" }}>{m.date}</span>
                    <span className="label font-bold" style={{ color: i === 1 ? "var(--c3)" : "var(--dim)" }}>{m.tag}</span>
                  </div>
                  <h3 className="text-white text-[16px] font-bold leading-snug" style={{ fontFamily: "Inter" }}>{m.title}</h3>
                  <p className="text-[12px] leading-6 text-[var(--dim)] mt-2.5">{m.body}</p>
                  <div className="mt-5 rounded-lg overflow-hidden border border-white/[0.07] bg-[#05070a]">
                     <div className="flex gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.05]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        <span className="ml-auto label opacity-20" style={{ fontSize: 6 }}>TERMINAL.LOG</span>
                     </div>
                     <div className="p-3.5 text-[10px] leading-5 overflow-x-auto font-mono" style={{ color: "#6fffc4" }}>
                        {m.code.slice(0, 2).map((c, j) => <div key={j} className="whitespace-nowrap opacity-80">{c}</div>)}
                     </div>
                  </div>
                </article>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =================== SOCIAL =================== */
function Social() {
  const { socialHover, setSocialHover } = useStore();
  return (
    <section id="social" className="mt-12">
      <Hdr kicker="05 · CONSTELLATION" title="Global Nodes" sub="HOVER TO CAST LIGHT BEAMS" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOCIALS.map((s, i) => {
          const Icon = SOCIAL_ICONS[s.id] || Rocket;
          const on = socialHover === i;
          return (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer"
              onPointerEnter={() => setSocialHover(i)} onPointerLeave={() => setSocialHover(-1)} onClick={() => vibe(10)}
              className="panel panel-hover relative flex items-center gap-4 p-5 pointer-events-auto group overflow-hidden"
              style={{ borderColor: on ? "color-mix(in srgb, var(--c1) 45%, transparent)" : undefined }}>
              {/* hover sweep */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(0,255,157,.04), transparent 50%)" }} />
              <span className="w-11 h-11 grid place-items-center rounded-lg border border-white/10 transition relative z-10" style={{ color: on ? "var(--c1)" : "var(--dim)", background: on ? "color-mix(in srgb, var(--c1) 10%, transparent)" : "rgba(0,0,0,.3)" }}>
                <Icon size={17} />
              </span>
              <span className="flex-1 min-w-0 relative z-10">
                <span className="block text-[13px] font-bold text-white">{s.label}</span>
                <span className="block label mt-1">{s.handle}</span>
              </span>
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10" style={{ color: "var(--c1)" }} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* =================== ABOUT =================== */
function About() {
  const facts = [
    { icon: CalendarDays, k: "Born", v: ID.born },
    { icon: MapPin, k: "Region", v: "Dholpur, Rajasthan, IN" },
    { icon: Shield, k: "Sacred date", v: ID.sacred },
    { icon: Dumbbell, k: "Karate begins", v: ID.karateStart },
    { icon: Cpu, k: "Transmitter", v: ID.email },
    { icon: Award, k: "Rank", v: "Black Belt · Undefeated" },
  ];
  const stats: [string, string][] = [
    ["BORN", "December Born"], ["MARTIAL ARTS", "Since 2015"], ["NATIONAL TITLES", "Karate · Grappling"], ["BASE", "Dholpur, India"],
  ];
  return (
    <section id="about" className="mt-12">
      <Hdr kicker="06 · IDENTITY" title="About the Operator" sub="PERSONAL FILE" />
      <div className="panel grid grid-cols-2 md:grid-cols-4 mb-6 rv overflow-hidden">
        {stats.map(([k, v], i) => (
          <div key={k} className={`p-5 sm:p-6 group hover:bg-white/[0.02] transition-colors ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
            <div className="label font-bold" style={{ color: "var(--gold)", opacity: 0.8 }}>{k}</div>
            <div className="text-white text-[16px] sm:text-[18px] font-extrabold mt-2 tnum group-hover:text-[var(--gold)] transition-colors" style={{ fontFamily: "Inter" }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="panel p-6 sm:p-8 lg:col-span-2 rv">
          <div className="flex items-center gap-2 mb-1"><Sparkles size={14} style={{ color: "var(--gold)" }} /><span className="label-gold font-black">THE AYUSH SHRIVASTAVA MANIFESTO</span></div>
          <div className="label mt-2" style={{ color: "var(--c1)" }}>AYUSH SHRIVASTAVA · DHOLPUR, RAJASTHAN</div>
          <p className="mt-4 text-[13px] leading-7 text-slate-300/90">{ID.manifesto[1]}</p>
          <div className="my-6 h-px bg-white/[0.07]" />
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {ID.manifesto.slice(3, 11).map((l, i) => (
              <div key={i} className="flex gap-3 text-[12px] leading-6 text-[var(--dim)] group">
                <span className="mt-[7px] w-1.5 h-1.5 rotate-45 shrink-0 group-hover:scale-150 transition-transform" style={{ background: i % 2 ? "var(--c2)" : "var(--c1)" }} />
                {l}
              </div>
            ))}
          </div>
          <p className="mt-6 pl-3 border-l-2 text-[11px] leading-5 text-[var(--dim)] italic" style={{ borderColor: "var(--gold)" }}>{ID.bio}</p>
        </div>
        <div className="space-y-3 rv">
          {facts.map(({ icon: Icon, k, v }) => (
            <div key={k} className="panel panel-hover flex items-center gap-4 p-4 border-[rgba(246,224,179,0.1)] hover:border-[var(--gold)] group">
              <span className="w-9 h-9 grid place-items-center rounded-md border border-[rgba(246,224,179,0.2)] shrink-0 bg-[var(--gold)]/5 group-hover:bg-[var(--gold)]/10 transition-colors" style={{ color: "var(--gold)" }}>
                <Icon size={15} />
              </span>
              <span className="min-w-0">
                <span className="block label font-bold" style={{ color: "var(--gold)", opacity: 0.8 }}>{k}</span>
                <span className="block text-[12px] text-white mt-1.5 truncate font-medium">{v}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================== CONTACT =================== */
function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sent || sending) return;
    setSending(true);
    setError("");
    vibe([10, 20, 10]);

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        "service_18imwqm",
        "template_q97snts",
        {
          from_name: name.trim(),
          reply_to: email.trim(),
          message: message.trim(),
          to_email: "akasipian007@gmail.com",
          sent_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        },
        { publicKey: "E0WM5fHCn0PxMdj7L" }
      );
      setSent(true);
      G.transmitPulse = 1;
      vibe([20, 50, 20]);
      setTimeout(() => { setSent(false); setName(""); setEmail(""); setMessage(""); }, 5000);
    } catch (err: any) {
      setError("Failed to send. Please try again or email directly: akasipian007@gmail.com");
      vibe([30, 80, 30]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="signal" className="mt-12">
      <Hdr kicker="07 · TRANSMITTER" title="Open Comms" sub="SECURE CHANNEL" />
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3 rv">
          <div className="panel p-6">
            <div className="label font-bold mb-4" style={{ color: "var(--gold)" }}>DIRECT CHANNELS</div>
            <a href={`mailto:${ID.email}`} className="flex items-center gap-3 py-3 border-b border-white/[0.06] text-[12.5px] text-slate-200 hover:text-[var(--c1)] transition group">
              <Mail size={14} style={{ color: "var(--c1)" }} />
              <span className="group-hover:translate-x-1 transition-transform">{ID.email}</span>
            </a>
            <div className="flex items-center gap-3 py-3 border-b border-white/[0.06] text-[12.5px] text-slate-200 tnum">
              <Cpu size={14} style={{ color: "var(--c1)" }} /> {ID.phone}
            </div>
            <div className="flex items-center gap-3 py-3 text-[12.5px] text-slate-200">
              <MapPin size={14} style={{ color: "var(--c1)" }} /> {ID.location}
            </div>
          </div>
          <div className="panel p-6">
            <div className="label font-bold mb-2" style={{ color: "var(--gold)" }}>STATUS</div>
            <div className="text-[12px] text-slate-300 leading-7">
              <TypeWriter text="Training at dawn · building by night. Open to collaborations, hackathons, and disciplined ideas." speed={25} />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-3 panel p-6 sm:p-8 rv pointer-events-auto">
          <div className="label-gold font-black mb-5" style={{ fontSize: 8, letterSpacing: "0.45em" }}>SECURE TRANSMITTER</div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input required aria-label="Your name" autoComplete="name" maxLength={80} disabled={sending || sent} placeholder="YOUR CODENAME" value={name} onChange={e => setName(e.target.value)}
              className="bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[12px] text-white placeholder:text-[var(--dim)]/50 transition-all" />
            <input type="email" required aria-label="Your email" autoComplete="email" maxLength={254} disabled={sending || sent} placeholder="YOUR EMAIL" value={email} onChange={e => setEmail(e.target.value)}
              className="bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[12px] text-white placeholder:text-[var(--dim)]/50 transition-all" />
          </div>
          <textarea required aria-label="Your message" minLength={5} maxLength={2000} disabled={sending || sent} rows={5} placeholder="YOUR MESSAGE TO AYUSH" value={message} onChange={e => setMessage(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[12px] text-white placeholder:text-[var(--dim)]/50 resize-none transition-all mb-4" />
          <button type="submit" disabled={sending || sent} className={`w-full flex items-center justify-center gap-2.5 py-4 text-[13px] font-black rounded-lg transition-all disabled:opacity-70 ${sent ? "bg-[var(--c1)] text-black" : "btn-gold"}`}>
            <Send size={14} /> {sending ? "Sending..." : sent ? "MESSAGE SENT ✓" : "Send to Ayush Shrivastava"}
          </button>
          {sent && <div role="status" className="mt-3 text-center label animate-pulse" style={{ color: "var(--c1)" }}>✓ Delivered to akasipian007@gmail.com</div>}
          {error && <div role="alert" className="mt-3 text-center text-[11px] text-red-400">{error}</div>}
          <div className="mt-4 flex justify-between label opacity-30" style={{ fontSize: 7 }}>
            <span>{ID.location}</span><span>Response within 24h</span>
          </div>
        </form>
      </div>
    </section>
  );
}

/* =================== FOOTER =================== */
function Footer() {
  return (
    <footer className="mt-12 panel p-6 sm:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 w-60 h-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(246,224,179,.04), transparent 70%)" }} />
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 grid place-items-center rounded-md font-extrabold text-[#000] text-xs bg-gold-grad shadow-lg shadow-[var(--gold)]/20">AS</span>
          <div>
            <div className="carbon-text text-[15px] font-extrabold leading-none">AYUSH SHRIVASTAVA</div>
            <div className="label mt-1" style={{ color: "var(--dim)" }}>PERSONAL HQ</div>
          </div>
        </div>
        <div className="carbon-text text-[10px] tracking-[0.38em] uppercase" style={{ color: "var(--gold)", opacity: 0.75 }}>
          Let's Build..&nbsp;&nbsp;<span className="text-[var(--c1)]">Let's Conquer...</span>
        </div>
      </div>
      <div className="h-px bg-white/[0.07] my-5" />
      <div className="flex flex-wrap items-center justify-between gap-3 label">
        <span>5D MATRIX GRID ACTIVE · TIME-WARP 2.00×</span>
        <span>© 2014–∞ {ID.name} · Dholpur, Rajasthan</span>
      </div>
    </footer>
  );
}

/* =================== ROOT =================== */
export default function Sections() {
  const phase = useStore((s) => s.phase);
  const scope = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== "live") return;
    const sc = document.getElementById("scroll-container");
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".rv").forEach((el) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0, filter: "blur(4px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.65, ease: "power2.out", force3D: true,
            scrollTrigger: { trigger: el, scroller: sc as any, start: "top 96%", toggleActions: "play none none reverse" } }
        );
      });
      ScrollTrigger.refresh();
    }, scope);
    return () => ctx.revert();
  }, [phase]);
  return (
    <div ref={scope} id="dbg-scope" className="relative z-10 p-3 sm:p-5 lg:p-7 pb-10">
      <div className="max-w-[1440px] mx-auto space-y-0">
        <Hero />

        {/* ── Marquee band between Hero & Achievements ── */}
        <div className="my-8 border-y border-white/[0.06] bg-black/20 overflow-hidden">
          <MarqueeBand direction={1} />
        </div>

        <Achievements />
        <Projects />
        <Skills />
        <Journey />
        <Social />

        {/* ── Reverse marquee band ── */}
        <div className="my-8 border-y border-white/[0.06] bg-black/20 overflow-hidden">
          <MarqueeBand direction={-1} />
        </div>

        <About />
        <Contact />
        <div className="mt-6"><Footer /></div>
      </div>
    </div>
  );
}

/* =================== PROJECTS =================== */
const PROJ_ICONS: Record<string, any> = { Shield, Target, Cpu };

function Projects() {
  return (
    <section id="projects" className="mt-12">
      <Hdr kicker="03 · SHOWCASE" title="Strategic Builds" sub="AUTONOMOUS SYSTEMS" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((p) => {
          const Icon = PROJ_ICONS[p.icon] || Box;
          return (
            <a key={p.id} href={p.link} target="_blank" rel="noreferrer" className="panel panel-hover p-6 group pointer-events-auto block relative overflow-hidden">
               <Brackets size={12} inset={4} />
               <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 grid place-items-center rounded bg-white/[0.03] border border-white/10 group-hover:border-[var(--gold)]/30 transition-colors">
                     <Icon size={16} className="text-[var(--gold)] opacity-70 group-hover:opacity-100" />
                  </div>
                  <ExternalLink size={14} className="text-[var(--dim)] group-hover:text-white transition-colors" />
               </div>
               <h3 className="imperial text-white text-[16px] font-bold tracking-wide">{p.title}</h3>
               <p className="mt-3 text-[12px] leading-6 text-[var(--dim)] group-hover:text-slate-300 transition-colors">{p.description}</p>
               <div className="mt-5 flex flex-wrap gap-2">
                 {p.tags.map(t => <span key={t} className="text-[7px] tracking-widest uppercase border border-white/10 px-2 py-1 rounded bg-black/20 text-[var(--dim)]">{t}</span>)}
               </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
