import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  trigger?: boolean;
  speed?: number;
}

/** Military-grade text scramble reveal — seen on Awwwards winners */
export default function TextScramble({ text, className = "", style, trigger = true, speed = 30 }: Props) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    clearInterval(frame.current);
    frame.current = window.setInterval(() => {
      setDisplay(
        text.split("").map((letter, i) => {
          if (i < iteration) return letter;
          if (letter === " ") return " ";
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(frame.current);
      iteration += 0.5;
    }, speed);
    return () => clearInterval(frame.current);
  }, [text, trigger, speed]);

  return (
    <span className={className} style={{ ...style, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>
      {display}
    </span>
  );
}
