import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
	return (
		<button
			className={`bg-slate-800 border border-slate-600 hover:border-slate-400 text-slate-200 text-sm font-semibold uppercase tracking-wider px-5 py-2.5 rounded cursor-pointer transition-colors ${className?.trim() ?? ""}`}
			{...props}
		>
			{children}
		</button>
	);
}
