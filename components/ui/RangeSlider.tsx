import classNames from "classnames";

// Thin Tailwind-styled wrapper over native <input type="range">. Replaces
// Antd's Slider in the Chord Quality drill's arpeggiate control.

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  className,
}: Props) => (
  <input
    type="range"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    min={min}
    max={max}
    step={step}
    className={classNames(
      "w-full h-2 rounded-full appearance-none cursor-pointer",
      "bg-stone-200",
      // Webkit thumb
      "[&::-webkit-slider-thumb]:appearance-none",
      "[&::-webkit-slider-thumb]:w-4",
      "[&::-webkit-slider-thumb]:h-4",
      "[&::-webkit-slider-thumb]:rounded-full",
      "[&::-webkit-slider-thumb]:bg-amber-800",
      "[&::-webkit-slider-thumb]:shadow-sm",
      "[&::-webkit-slider-thumb]:transition-colors",
      "[&::-webkit-slider-thumb]:hover:bg-amber-900",
      // Firefox thumb
      "[&::-moz-range-thumb]:w-4",
      "[&::-moz-range-thumb]:h-4",
      "[&::-moz-range-thumb]:rounded-full",
      "[&::-moz-range-thumb]:bg-amber-800",
      "[&::-moz-range-thumb]:border-0",
      "[&::-moz-range-thumb]:shadow-sm",
      "focus-visible:outline-none",
      className
    )}
  />
);
