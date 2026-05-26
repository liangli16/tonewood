import classNames from "classnames";
import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

// The single Button primitive for the whole app. Replaces Antd's Button so
// the visual stays consistent across surfaces. Three variants by intent
// (primary / secondary / ghost), two sizes (md / lg).

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
};

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-amber-800 hover:bg-amber-900 active:bg-amber-900 text-white border border-amber-900/20 shadow-sm",
  secondary:
    "bg-stone-100 hover:bg-stone-200 active:bg-stone-200 text-stone-800 border border-stone-200",
  ghost:
    "bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-transparent",
};

const SIZE: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={classNames(
        "inline-flex items-center justify-center gap-2",
        "rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/30",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit",
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
