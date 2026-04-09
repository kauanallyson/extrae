interface CheckboxProps {
  label?: string;
  defaultChecked?: boolean;
}

export function Checkbox({ label, defaultChecked = false }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="accent-blue-500 cursor-pointer w-4 h-4"
      />
      {label}
    </label>
  );
}
