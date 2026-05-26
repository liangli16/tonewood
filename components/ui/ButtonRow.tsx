import classNames from "classnames";
import { ReactNode } from "react";

// Horizontal row of pill-shaped toggle buttons. Used for drill answer rows
// and instrument toggles.
//
// One unified callback (onItemClick) — the consumer decides what to do
// based on its own state. Keeps the component dumb.
//
// `highlight` lets the consumer override the visual tone of specific items
// (drills use this to mark the correct answer green after the user picks).

export type ButtonRowItem<T extends string | number> = {
  value: T;
  label: ReactNode;
};

type HighlightTone = "correct" | undefined;

type Props<T extends string | number> = {
  items: ButtonRowItem<T>[];
  value?: T;
  onItemClick: (v: T) => void;
  disabled?: boolean;
  className?: string;
  highlight?: Partial<Record<string, HighlightTone>>;
};

export const ButtonRow = <T extends string | number>({
  items,
  value,
  onItemClick,
  disabled,
  className,
  highlight,
}: Props<T>) => (
  <div className={classNames("inline-flex flex-wrap gap-2", className)}>
    {items.map((it) => {
      const selected = it.value === value;
      const tone = highlight?.[String(it.value)];
      const isCorrect = tone === "correct";
      return (
        <button
          key={String(it.value)}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onItemClick(it.value);
          }}
          className={classNames(
            "inline-flex items-center justify-center",
            "px-3 py-1.5 text-sm rounded-md border transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/30",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            isCorrect
              ? "bg-green-50 text-green-700 border-green-300"
              : selected
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
          )}
        >
          {it.label}
        </button>
      );
    })}
  </div>
);
