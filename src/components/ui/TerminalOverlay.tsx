import { useEffect, useRef, useState } from "react";
import { ID, HARDWARE, SKILLS, SOURCE_SNIPPET } from "../../lib/data";
import { useStore } from "../../lib/store";
import { vibe } from "../../lib/uniforms";
import { audio } from "../../lib/audio";

type Line = { t: "in" | "out" | "sys"; s: string };

const BANNER = [
  "┌─ AKSPN://RAW_TERMINAL ──────────────────────────────┐",
  "│  aesthetic layer ..... SHUTDOWN                     │",
  "│  privilege ........... ROOT (obviously)             │",
  "│  shell ............... karate-sh 2.1                │",
  "└─────────────────────────────────────────────────────┘",
  "type 'help' — but you already knew that.",
];

export default function TerminalOverlay() {
  const setMode = useStore((s) => s.setMode);
  const setSplash = useStore((s) => s.setSplash);
  const [lines, setLines] = useState<Line[]>(BANNER.map((s) => ({ t: "sys" as const, s })));
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 999999 });
  }, [lines]);

  const push = (arr: (Line | string)[], t: Line["t"] = "out") =>
    setLines((p) => [...p, ...arr.map((s) => (typeof s === "string" ? { t, s } : (s as Line)))].slice(-220));

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    push([{ t: "in", s: `ayush@grid:~$ ${raw}` }]);
    if (!cmd) return;
    const [head, ...args] = cmd.split(/\s+/);
    switch (head) {
      case "help":
        push([
          "help ........ this",
          "whoami ...... identity ledger",
          "specs ....... the first legendary build",
          "skills ...... arsenal dump",
          "source ...... unredacted react source",
          "ls .......... vault folders",
          "open <file> . read a vault file",
          " decrypt .... try it. i dare you.",
          "clear ....... wipe buffer",
          "exit ........ return to sovereign layer",
        ]);
        break;
      case "whoami":
        push([ID.name, `codename: ${ID.handle} — ${ID.title}`, `grid: ${ID.location}`, `born: ${ID.born} // sacred: ${ID.sacred}`, `bio: ${ID.bio}`]);
        break;
      case "specs":
        push([
          `[DEVICE] ${HARDWARE.device}`,
          `cpu: ${HARDWARE.cpu}`,
          `ram: ${HARDWARE.ram}`,
          `ssd: ${HARDWARE.ssd}`,
          `hdd: ${HARDWARE.hdd}`,
          `gpu: ${HARDWARE.gpu}`,
          "// " + HARDWARE.note,
        ]);
        break;
      case "skills":
        push(SKILLS.map((s) => `${s.label.padEnd(20)} [${"#".repeat(Math.round(s.mastery / 5)).padEnd(20, ".")}] ${s.mastery}%  // ${s.era}`));
        break;
      case "source":
        push(SOURCE_SNIPPET.split("\n"));
        break;
      case "ls":
        push(["drwx  dojo/", "drwx  exploits/", "drwx  homework_never_done/", "-r--  nunchucks.config", "-r--  class10_boards.log", "----  21042014.seal  [ENCRYPTED]", "----  dream_karate_2015.bak"]);
        break;
      case "open": {
        const f = args.join(" ");
        if (!f) return push(["open: missing operand"]);
        if (f.includes("2104") || f.includes("seal") || f.includes("decrypt")) {
          push(["brute-forcing seal ▓▓▓▓▓▓▓▓▓▓ 100%", "ACCESS GRANTED — sacred ledger mounted one time only"]);
          setTimeout(() => setSplash(true), 500);
        } else if (f.includes("class10")) push(["boards.index = 83% — conquered with html+css side quests"]);
        else if (f.includes("dream")) push(["2015-06-16 06:00 :: 'mom, karate starts today.' — restored"]);
        else if (f.includes("dojo")) push(["belts: WHITE→…→BLACK", "record: UNDEFEATED", "weapon: nunchucks (virtuoso)"]);
        else push([`open: '${f}' — file exists only in the future`]);
        break;
      }
      case "decrypt":
        push(["no ciphertext given. try: open 21042014.seal"]);
        break;
      case "sudo":
        push(["you ARE sudo. stop checking."]);
        break;
      case "matrix":
        push(["there is no spoon. there is only the roundhouse kick. — noe"]);
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
        audio.blip(220, 0.1);
        setMode("sovereign");
        break;
      default:
        push([`karate-sh: command not found: '${head}' (hit it with 'help')`]);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] p-3 sm:p-8 pointer-events-auto" onClick={() => inputRef.current?.focus()}>
      <div className="h-full w-full glass-hard edge-glow crownline relative flex flex-col overflow-hidden" style={{ borderRadius: 2, borderColor: "color-mix(in srgb, var(--c1) 30%, var(--line))" }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em]">
            <span className="w-2 h-2 rounded-full bg-[var(--c1)] pulse-dot" />
            <span className="text-[var(--c1)]">HACKER NODE</span>
            <span className="text-[var(--dim)] hidden sm:block">// raw kernel — ui skin: disabled</span>
          </div>
          <button onClick={() => { vibe(8); setMode("sovereign"); }} className="text-[10px] tracking-[0.25em] text-[var(--dim)] hover:text-[var(--c1)] border border-white/15 hover:border-[var(--c1)]/50 px-3 py-1 transition-colors">
            RELEASE [ESC]
          </button>
        </div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 text-[11px] sm:text-[12px] leading-6 font-medium">
          {lines.map((l, i) => (
            <div key={i} className={l.t === "in" ? "text-[var(--c2)]" : l.t === "sys" ? "text-[var(--c1)]/80" : "text-[var(--tx)]"}>
              {l.s}
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2 bg-black/50">
          <span className="text-[var(--c2)] text-[12px]">ayush@grid:~$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); if (Math.random() > 0.7) audio.blip(1600 + Math.random() * 600, 0.012, 0.02); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { run(input); setInput(""); vibe(6); }
              if (e.key === "Escape") setMode("sovereign");
            }}
            className="flex-1 bg-transparent outline-none text-[12px] text-[var(--tx)] caret-[var(--c1)]"
            spellCheck={false}
            placeholder="type 'help'"
          />
        </div>
      </div>
    </div>
  );
}
