import classNames from "classnames";

// Horizontal row of pill-shaped toggle buttons. Used for drill answer rows
// (single-select), drill option toggles, and instrument toggles.
//
// Supports an optional `highlight` map that overrides the rendered border
// color of specific values (drills use this to mark the correct answer
// green after the user picks).

type ButtonRowItem<T extends string | number> = {
  value: T;
  label: React.ReactNode;
};

type HighlightTone = "correct" | undefined;

type Props<T extends string | number> = {
  items: ButtonRowItem<T>[];
  value?: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  className?: string;
  // Per-item visual override. Used by drills to turn the correct answer
  // green after the user has answered.
  highlight?: Partial<Record<string, HighlightTone>>;
  // Click handler invoked after a value is already selected (used by
  // ChordQuality for "click to replay this voicing").
  onItemClick?: (v: T) => void;
};

export const ButtonRow = <T extends string | number>({
  items,
  value,
  onChange,
  disabled,
  className,
  highlight,
  onItemClick,
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
            if (selected && onItemClick) onItemClick(it.value);
            else onChange(it.value);
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
