import { create } from "zustand";

export type Mode = "sovereign" | "hacker" | "dev" | "client" | "boss" | "kid";

export const MODES: { id: Mode; label: string; glyph: string }[] = [
  { id: "sovereign", label: "SOVEREIGN", glyph: "◆" },
  { id: "hacker", label: "HACKER", glyph: ">_" },
  { id: "dev", label: "DEV/QA", glyph: "#" },
  { id: "client", label: "CLIENT", glyph: "▣" },
  { id: "boss", label: "BOSS", glyph: "♛" },
  { id: "kid", label: "KID", glyph: "☄" },
];

type State = {
  mode: Mode;
  phase: "boot" | "intro" | "live";
  skillId: string;
  socialHover: number;
  orbsCollected: number[];
  splash: boolean;
  bloodline: boolean;
  gravity: boolean;
  audioOn: boolean;
  setMode: (m: Mode) => void;
  setPhase: (p: State["phase"]) => void;
  setSkill: (s: string) => void;
  setSocialHover: (i: number) => void;
  collectOrb: (i: number) => void;
  setSplash: (b: boolean) => void;
  setBloodline: (b: boolean) => void;
  setGravity: (b: boolean) => void;
  setAudioOn: (b: boolean) => void;
};

export const useStore = create<State>((set) => ({
  mode: "sovereign",
  phase: "intro",
  skillId: "html",
  socialHover: -1,
  orbsCollected: [],
  splash: false,
  bloodline: false,
  gravity: false,
  audioOn: false,
  setMode: (mode) => set({ mode }),
  setPhase: (phase) => set({ phase }),
  setSkill: (skillId) => set({ skillId }),
  setSocialHover: (socialHover) => set({ socialHover }),
  collectOrb: (i) => set((s) => (s.orbsCollected.includes(i) ? s : { orbsCollected: [...s.orbsCollected, i] })),
  setSplash: (splash) => set({ splash }),
  setBloodline: (bloodline) => set({ bloodline }),
  setGravity: (gravity) => set({ gravity }),
  setAudioOn: (audioOn) => set({ audioOn }),
}));
