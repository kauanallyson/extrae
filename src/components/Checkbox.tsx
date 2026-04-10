import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        className={`accent-blue-500 cursor-pointer w-4 h-4 ${className?.trim() ?? ""}`}
        {...props}
      />
      {label}
    </label>
  );
}
