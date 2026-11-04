import * as THREE from "three";

/** crisp monospace label sprite texture */
export function makeLabelTexture(lines: string[], color = "#22d3ee", w = 512, h = 160): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, w, h);
  x.font = "600 34px 'JetBrains Mono', monospace";
  x.textBaseline = "middle";
  x.shadowColor = color; x.shadowBlur = 18;
  x.fillStyle = color;
  const size = h / (lines.length + 1);
  lines.forEach((ln, i) => {
    if (i > 0) { x.font = "500 22px 'JetBrains Mono', monospace"; x.fillStyle = "rgba(190,220,255,0.75)"; }
    x.fillText(ln, 18, size * (i + 1) - 6);
  });
  x.shadowBlur = 0; x.strokeStyle = color; x.lineWidth = 3;
  x.globalAlpha = 0.9;
  x.beginPath();
  x.moveTo(2, 22); x.lineTo(2, 2); x.lineTo(22, 2);
  x.moveTo(w - 22, h - 2); x.lineTo(w - 2, h - 2); x.lineTo(w - 2, h - 22);
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

/** soft round glow sprite */
export function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(190,240,255,0.6)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** scrolling telemetry strip texture */
export function makeTelemetryTexture(seed = 0): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 64;
  const x = c.getContext("2d")!;
  x.font = "500 22px 'JetBrains Mono', monospace";
  const chars = "01xA9F#$%&*+=<>[]{}";
  x.fillStyle = "rgba(120,255,200,0.85)";
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let str = "";
  for (let i = 0; i < 90; i++) str += rnd() > 0.12 ? chars[Math.floor(rnd() * chars.length)] : " ";
  x.fillText(str, 4, 40);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
