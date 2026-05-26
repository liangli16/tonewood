import classNames from "classnames";
import { HTMLAttributes, ReactNode } from "react";

// Generic card surface. Quiet by default; opt into hover via prop.
type Props = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
  children?: ReactNode;
};

export const Card = ({
  hoverable = false,
  className,
  children,
  ...rest
}: Props) => (
  <div
    className={classNames(
      "bg-white border border-stone-200/70 rounded-xl",
      "transition-all",
      hoverable && "hover:border-stone-300 hover:shadow-sm",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
