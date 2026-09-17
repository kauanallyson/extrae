import type { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";

export function PageMessage({ children }: { children: ReactNode }) {
	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<p className="py-8 text-center text-sm text-slate-500">{children}</p>
		</Layout>
	);
}
