import { Select, Tag } from "antd";

export type MultiSelectOption<T extends string | number> = {
  value: T;
  label: string;
  chipLabel?: string;
};

type Props<T extends string | number> = {
  value: T[];
  onChange: (next: T[]) => void;
  options: MultiSelectOption<T>[];
};

export const MultiSelect = <T extends string | number>({
  value,
  onChange,
  options,
}: Props<T>) => (
  <Select
    mode="multiple"
    value={value as unknown as (string | number)[]}
    onChange={(v) => {
      const next = v as T[];
      if (next.length === 0) return;
      onChange(next);
    }}
    options={options.map((o) => ({ value: o.value, label: o.label }))}
    tagRender={({ value: v, closable, onClose }) => {
      const opt = options.find((o) => o.value === (v as T));
      return (
        <Tag
          closable={closable}
          onClose={onClose}
          style={{ marginInlineEnd: 4 }}
        >
          {opt?.chipLabel ?? opt?.label ?? String(v)}
        </Tag>
      );
    }}
    style={{ minWidth: "100%" }}
  />
);
