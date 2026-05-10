import { ReactNode } from "react";

type Props = {
  label: ReactNode;
  children: ReactNode;
  minWidth?: number;
};

export const FormField = ({ label, children, minWidth = 200 }: Props) => (
  <div className="flex flex-col gap-1" style={{ minWidth }}>
    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-stone-500">
      {label}
    </span>
    {children}
  </div>
);
