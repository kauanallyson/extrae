import { LoaderCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";

const contentClassName = "block max-w-6xl py-8 sm:py-10";

export function PageLoading({ label }: { label?: string }) {
	return (
		<Layout contentClassName={contentClassName}>
			<div className="flex items-center justify-center py-20 text-slate-400">
				<LoaderCircleIcon className="h-6 w-6 animate-spin" />
				{label && <span className="ml-3">{label}</span>}
			</div>
		</Layout>
	);
}

export function PageMessage({ children }: { children: ReactNode }) {
	return (
		<Layout contentClassName={contentClassName}>
			<p className="py-8 text-center text-sm text-slate-500">{children}</p>
		</Layout>
	);
}
