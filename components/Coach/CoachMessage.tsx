import classNames from "classnames";
import type { Message } from "@/utils/coachMemory";
import { ReactNode } from "react";

type Props = { message: Message };

// Minimal markdown: paragraph breaks on blank lines, **bold** inline.
const renderInline = (s: string): ReactNode => {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

const renderText = (text: string): ReactNode => {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((p, i) => (
    <p key={i} className={i > 0 ? "mt-2" : ""}>
      {renderInline(p)}
    </p>
  ));
};

export const CoachMessage = ({ message }: Props) => {
  if (message.role === "system") return null;
  const isCoach = message.role === "coach";
  return (
    <div
      className={classNames("flex", isCoach ? "justify-start" : "justify-end")}
    >
      <div
        className={classNames(
          "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isCoach
            ? "bg-white border border-stone-200 text-stone-800"
            : "bg-amber-700 text-white"
        )}
      >
        {renderText(message.text)}
      </div>
    </div>
  );
};
