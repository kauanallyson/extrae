import type { ReactNode } from "react";

type FormSectionProps = {
	title: string;
	description: string;
	children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
	return (
		<section className="border-t border-white/10 pt-6">
			<div className="mb-4">
				<h2 className="text-base font-semibold text-slate-50">{title}</h2>
				<p className="mt-1 text-sm text-slate-400">{description}</p>
			</div>
			{children}
		</section>
	);
}
