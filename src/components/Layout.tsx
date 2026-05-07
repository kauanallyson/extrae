import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Navbar } from "./Navbar";

type LayoutProps = {
	children: ReactNode;
	contentClassName?: string;
};

export function Layout({ children, contentClassName }: LayoutProps) {
	return (
		<main className="dark flex min-h-dvh w-full flex-col bg-slate-900 text-slate-100">
			<Navbar />
			<div
				className={cn(
					"mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10",
					contentClassName,
				)}
			>
				{children}
			</div>
		</main>
	);
}
