export const ID = {
  name: "Ayush Shrivastava",
  handle: "AYUSH-01", // Unified identity handle
  title: "Personal HQ // Martial Artist · Cyberist · Engineer",
  location: "Dholpur, Rajasthan, IN",
  email: "akasipian007@gmail.com",
  phone: "+91 869090xxxx",
  born: "December Born",
  sacred: "21 APR 2014",
  karateStart: "16 JUN 2015",
  blackBeltDate: "17 FEB 2023",
  bio: "❤21 April 2014❤ | Ayush Shrivastava | Martial Artist 🥋 | Black Belt 🥋 5'8\" | 👊Athlete |🛡Cyberist |💻Tech lover 🇮🇳 • 🏋Freak • 🎮GTA vc",
  sloganA: "LET'S BUILD..",
  sloganB: "LET'S CONQUER...",
  manifesto: [
    "💡 Welcome to The Ayush Shrivastava Era. Let's build. Let's conquer. 🧠⚔🌐",
    "The Ayush Shrivastava Frequency ⚡ A movement for next-gen mind, body & tech evolution.",
    "🎂 December Born | 📍 Dholpur, Rajasthan INDIA",
    "🥋 Martial Artist | 🏋 Calisthenics | 🧘 Yoga | 👨‍💻 Tech Lover | 🎯 Future Karate Champ",
    "💻 Tech simplified — Python, HTML, CSS, SQL made actionable",
    "🥋 The Karate Way — Started 16 Jun 2015 | Black Belt: 17 Feb 2023 | Lifelong Mastery",
    "🏋 Strength & mobility — calisthenics, gym, recovery protocols",
    "🛼 Skating, cycling, coding — fueled by relentless growth",
    "🧠 Mindset mastery — discipline and winning strategy",
    "😂 Real talk — straight facts, jokes and humor",
    "Level up your skills, mindset and life. Let's build. Let's conquer. 🧠⚔",
  ],
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  icon: string;
};

export const PROJECTS: Project[] = [
  {
    id: "recon",
    title: "Project Recon-Ω",
    description: "An automated penetration testing framework built with Python, focused on rapid reconnaissance and vulnerability mapping.",
    tags: ["Python", "Ethical Hacking", "Automation"],
    link: "https://github.com/Akasipian",
    icon: "Shield",
  },
  {
    id: "dojo-sim",
    title: "Dojo Engine v1.0",
    description: "A custom SQL-driven backend for managing martial arts tournament brackets, belt progression, and athlete performance metrics.",
    tags: ["SQL", "Relational Design", "Data Engine"],
    link: "https://github.com/Akasipian",
    icon: "Target",
  },
  {
    id: "carbon-ui",
    title: "Carbon-Fibre GLSL",
    description: "A library of exotic-material shaders for WebGL, replicating the anisotropic sheen and 2x2 twill weave of high-end automotive surfaces.",
    tags: ["WebGL", "GLSL", "React"],
    link: "https://github.com/Akasipian",
    icon: "Cpu",
  },
];

export const HARDWARE = {
  device: "AYUSH-01 // The First Legend",
  cpu: "Intel i3-4170 @ 3.70GHz (2C/4T Haswell)",
  ram: "4GB DDR3 — pushed far beyond spec",
  ssd: "Ant Esports 690 NEO SSD",
  hdd: "WDC HDD (archival deep-storage)",
  gpu: "Intel HD Graphics 4400 — the underdog renderer",
  note: "An empire of worlds carved out of silicon that should not have survived it.",
};

export type Skill = {
  id: string;
  label: string;
  short: string;
  mastery: number;
  era: string;
  palette: [string, string];
  amp: number;
  twist: number;
  detail: string;
};

export const SKILLS: Skill[] = [
  {
    id: "html",
    label: "HTML / CSS",
    short: "STRUCTURE",
    mastery: 96,
    era: "Mastered — 10th Class",
    palette: ["#00ff9d", "#22d3ee"],
    amp: 0.34,
    twist: 1.6,
    detail: "Semantic architecture, animation systems, layout engines. The web bent into sculpture.",
  },
  {
    id: "python",
    label: "Python",
    short: "AUTOMATA",
    mastery: 92,
    era: "Mastered — 11th/12th Class",
    palette: ["#34d399", "#00ff9d"],
    amp: 0.52,
    twist: 2.4,
    detail: "Scripting, tooling, data pipelines, automation arsenals and AI-adjacent experiments.",
  },
  {
    id: "sql",
    label: "SQL",
    short: "MEMORY",
    mastery: 88,
    era: "Mastered — 11th/12th Class",
    palette: ["#e3c07b", "#00ff9d"],
    amp: 0.24,
    twist: 3.2,
    detail: "Relational design, query craft, data integrity. Structured truth at rest.",
  },
  {
    id: "cyber",
    label: "Cyber Security",
    short: "OFFENSE/DEFENSE",
    mastery: 90,
    era: "Post-12th — Active Operations",
    palette: ["#ff3b5c", "#e3c07b"],
    amp: 0.62,
    twist: 1.2,
    detail: "Ethical hacking, recon, hardening. Thinking like the intrusion to defeat it.",
  },
  {
    id: "dojo",
    label: "Karate / Grappling",
    short: "THE BODY",
    mastery: 99,
    era: "Since 16 Jun 2015 — Black Belt (17 Feb 2023)",
    palette: ["#ffffff", "#00ff9d"],
    amp: 0.18,
    twist: 0.7,
    detail: "Black belt achieved 17 Feb 2023. Nunchucks virtuoso. Undefeated on the mat. A lifelong martial journey.",
  },
  {
    id: "react",
    label: "React / Three.js",
    short: "DIMENSIONS",
    mastery: 85,
    era: "Current Frontier",
    palette: ["#22d3ee", "#e3c07b"],
    amp: 0.45,
    twist: 2.9,
    detail: "Component systems, WebGL pipelines, shader engineering. Interfaces that breathe.",
  },
];

export type Milestone = {
  id: string;
  date: string;
  title: string;
  body: string;
  tag: string;
  z: number;
  code: string[];
};

export const TIMELINE: Milestone[] = [
  {
    id: "avm",
    date: "18 APR 2014",
    title: "AVM Convent School — Initialization",
    body: "Training container initialized at AVM Convent School, Dholpur, Rajasthan (CBSE). The kernel of everything boots here.",
    tag: "GENESIS",
    z: -78,
    code: ["$ init --school AVM_CONVENT_DHL", "> container secured :: CBSE", "> student.id = ayush"],
  },
  {
    id: "sacred",
    date: "21 APR 2014",
    title: "The Sacred Milestone",
    body: "A cryptographically sealed date. The unforgettable signal burned into the Ayush Shrivastava ledger. Access is... restricted.",
    tag: "ENCRYPTED",
    z: -88,
    code: ["0x04212014 :: SEALED", "> hash.verify(heart) == TRUE"],
  },
  {
    id: "karate",
    date: "16 JUN 2015",
    title: "The Karate Way Begins",
    body: "First step onto the mat. A decade-long discipline ignition: karate, grappling, nunchucks — the body compiled into a weapon.",
    tag: "DOJO",
    z: -100,
    code: ["$ dojo.enter(2015-06-16)", "> belt[0] = WHITE", "> for(;;){ train(); }"],
  },
  {
    id: "class10",
    date: "CLASS 10",
    title: "Board Conquest — 83%",
    body: "Boards conquered with an 83% index scoresheet. HTML & CSS mastered in parallel — first real builds deployed from thin air.",
    tag: "ACADEMIC",
    z: -114,
    code: ["<section id='victory'>", "  score: 83%;", "  weapons: ['html','css']", "</section>"],
  },
  {
    id: "class12",
    date: "CLASS 12",
    title: "PCM + IP Specialization — 69%",
    body: "Physics, Chemistry, Mathematics and Informatics Practices mastered. Python and SQL absorbed into the arsenal mid-storm.",
    tag: "ACADEMIC",
    z: -128,
    code: ["subjects = ['P','C','M','IP']", "arsenal += ['python','sql']", "print('69% — under fire')"],
  },
  {
    id: "sportshead",
    date: "THE CROWN",
    title: "Campus Sports Head",
    body: "Chosen as Sports Head. Left an unrepeatable school legend — ultimate Nunchucks virtuoso, undefeated Karate player.",
    tag: "LEGEND",
    z: -142,
    code: ["$ crown --grant sports_head", "> streak: UNDEFEATED", "> legend.status = ETERNAL"],
  },
  {
    id: "grad",
    date: "14 AUG 2026",
    title: "Graduation — To The Open World",
    body: "High school layout matrix completed. The protective sandbox dissolves — Ayush Shrivastava ventures into the open digital world.",
    tag: "DEPARTURE",
    z: -156,
    code: ["$ graduate --force", "> sandbox: DISMANTLED", "> world: ENTERED"],
  },
  {
    id: "android",
    date: "22 AUG 2026",
    title: "First Android Node Activated",
    body: "First dedicated mobile Android device network node activated. The broadcast goes portable. The frequency goes global.",
    tag: "NETWORK",
    z: -168,
    code: ["$ node.up(android.01)", "> uplink: PORTABLE", "> frequency: GLOBAL"],
  },
];

export const SOCIALS = [
  { id: "github", label: "GitHub", handle: "@Akasipian", url: "https://github.com/Akasipian", beacon: "REPO-CORE" },
  { id: "linkedin", label: "LinkedIn", handle: "Ayush Shrivastava", url: "https://www.linkedin.com/in/ayush-s-798a57435", beacon: "PRO-GRID" },
  { id: "x", label: "Twitter / X", handle: "@Akasipian", url: "https://x.com/Akasipian", beacon: "SIGNAL-NET" },
  { id: "instagram", label: "Instagram", handle: "@itz_akasipian", url: "https://www.instagram.com/itz_akasipian/", beacon: "VISUAL-FEED" },
  { id: "youtube", label: "YouTube", handle: "@akasipian", url: "https://youtube.com/@akasipian?si=60CQNzQeZmWe6T8C", beacon: "BROADCAST" },
  { id: "devpost", label: "Devpost", handle: "ayush", url: "https://devpost.com/akasipian", beacon: "HACK-VAULT" },
];

export const HEXDUMP = [
  "0x0A4B1F 9C 2E 71 FF  :: AKSPN-CORE",
  "0x0B77C2 04 D1 8A 3F  :: UPLINK-03",
  "0x0D21E0 7B 19 C4 50  :: DOJO-MEM",
  "0x0F00A8 E2 66 0B 9D  :: VAULT-SEAL",
  "0x1142FF 20 AC 57 E1  :: SIGNAL-TX",
  "0x19A0D4 88 F3 12 6C  :: GRID-Ω",
];

export const BOOT_LINES = [
  "AKSPN/OS v4.7 — sovereign boot kernel",
  "alloc:: particle reservoir [80000 units] ......... OK",
  "alloc:: fluid solver grid [128² cells] ........... OK",
  "handshake identity ledger :: ayush.shrivastava ... VERIFIED",
  "mount /dev/dojo — black_belt.ext4 ................ MOUNTED",
  "compile shader stack [GLSL 300 es] ............... 14 passes",
  "calibrate octree spatial index ................... BALANCED",
  "sync chrono-stream :: 2014-04-18 → 2026-08-22 .... LOCKED",
  "inject graphite signal palette ................... APPLIED",
  "awaken nexus core ................................ ARMED",
  "lets_build(); lets_conquer();",
];

export const SOURCE_SNIPPET = `// nexus.core.tsx — live source, unredacted
const Core = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    u.value.u_time  += dt * G.timeScale;
    u.value.u_amp    = lerp(u.value.u_amp,
      skill.amp + G.mouseVel.length() * 0.9, 0.08);
    ref.current.rotation.y += dt * 0.22 * G.timeScale;
  });
  return <mesh ref={ref} geometry={knot}>
    <shaderMaterial {...{ uniforms: u, ...nexusProgram }} />
  </mesh>;
};`;
