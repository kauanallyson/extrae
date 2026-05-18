import { Link, NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { buttonVariants } from "./ui/button";

const routes = [
	{ to: "/", label: "Home" },
	{ to: "/extrair-amostra", label: "Extrair amostra" },
	{ to: "/mapa", label: "Mapa de amostras" },
];

export function Navbar() {
	return (
		<header className="w-full border-b border-white/10 bg-slate-950/90 backdrop-blur">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
				<Link to="/" className="flex items-center gap-3">
					<Logo />
					<span className="text-sm font-semibold tracking-[0.28em] text-slate-100">
						EXTRAE
					</span>
				</Link>

				<nav className="flex flex-wrap items-center gap-2 sm:justify-end">
					{routes.map((route) => (
						<NavLink
							key={route.to}
							to={route.to}
							className={({ isActive }) =>
								cn(
									buttonVariants({
										variant: isActive ? "default" : "ghost",
										size: "sm",
									}),
									"hover:bg-white hover:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950",
									"px-4",
								)
							}
							end={route.to === "/"}
						>
							{route.label}
						</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
}
