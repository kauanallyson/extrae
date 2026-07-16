import { LogOutIcon } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { buttonVariants } from "./ui/button";

const textRoutes = [
	{ to: "/amostras", label: "Amostras" },
	{ to: "/avaliadores", label: "Avaliadores" },
];

export function Navbar() {
	const { user, logout } = useAuth();

	return (
		<header className="w-full border-b border-white/10 bg-slate-950/90 backdrop-blur">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
				<Link to="/" className="flex items-center gap-3">
					<Logo />
					<span className="text-sm font-semibold tracking-[0.28em] text-slate-100">EXTRAE</span>
				</Link>

				<nav className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						{textRoutes.map((route) => (
							<NavLink
								key={route.to}
								to={route.to}
								end
								className={({ isActive }) =>
									cn(
										buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
										"hover:bg-white hover:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950",
									)
								}
							>
								{route.label}
							</NavLink>
						))}
					</div>

					{user && (
						<div className="flex items-center gap-2 border-l border-white/10 pl-3">
							<span className="text-sm text-slate-400">{user.nome}</span>
							<button
								type="button"
								title="Sair"
								onClick={logout}
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon-sm" }),
									"text-slate-400",
								)}
							>
								<LogOutIcon className="h-3.5 w-3.5" />
							</button>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}
