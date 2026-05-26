import classNames from "classnames";

// Horizontal row of options with a single active state. Used to replace
// Antd Tabs on /practice. Renders as a flex row of buttons; the active one
// gets a subtle background tint and a thin amber underline.

export type SegmentedControlItem<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
};

export const SegmentedControl = <T extends string>({
  items,
  value,
  onChange,
  className,
}: Props<T>) => (
  <div
    className={classNames(
      "inline-flex items-center gap-1 p-1 rounded-lg bg-stone-100",
      className
    )}
    role="tablist"
  >
    {items.map((it) => {
      const active = it.value === value;
      return (
        <button
          key={it.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(it.value)}
          className={classNames(
            "px-4 py-1.5 text-sm rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/30",
            active
              ? "bg-white text-stone-900 font-medium shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {it.label}
        </button>
      );
    })}
  </div>
);
