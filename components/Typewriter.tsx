import { useEffect, useState } from "react";

// Cycles through a list of phrases, typing each one character-by-character,
// holding, erasing, then advancing. Single small component, no library.

type Props = {
  phrases: string[];
  // ms per typed character
  typeSpeed?: number;
  // ms per erased character
  eraseSpeed?: number;
  // ms to hold a fully-typed phrase before erasing
  holdMs?: number;
  className?: string;
  // class applied to the blinking caret
  caretClassName?: string;
};

type Phase = "typing" | "holding" | "erasing";

export const Typewriter = ({
  phrases,
  typeSpeed = 60,
  eraseSpeed = 30,
  holdMs = 1500,
  className,
  caretClassName,
}: Props) => {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (!phrases.length) return;
    const target = phrases[idx % phrases.length];

    if (phase === "typing") {
      if (text.length < target.length) {
        const t = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          typeSpeed
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), 50);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("erasing"), holdMs);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      if (text.length > 0) {
        const t = setTimeout(
          () => setText(target.slice(0, text.length - 1)),
          eraseSpeed
        );
        return () => clearTimeout(t);
      }
      setIdx((i) => (i + 1) % phrases.length);
      setPhase("typing");
    }
  }, [text, phase, idx, phrases, typeSpeed, eraseSpeed, holdMs]);

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className={
          "inline-block w-[2px] h-[0.9em] align-middle ml-1 -mb-0.5 bg-current animate-blink " +
          (caretClassName ?? "")
        }
      />
    </span>
  );
};
