import { LoaderCircleIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export function PageLoading({ label }: { label?: string }) {
	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<div className="flex items-center justify-center py-20 text-slate-400">
				<LoaderCircleIcon className="h-6 w-6 animate-spin" />
				{label && <span className="ml-3">{label}</span>}
			</div>
		</Layout>
	);
}
