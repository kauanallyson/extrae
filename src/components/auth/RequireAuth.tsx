import { LoaderCircleIcon } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function RequireAuth() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-dvh w-full items-center justify-center bg-slate-900">
				<LoaderCircleIcon className="h-6 w-6 animate-spin text-slate-400" />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
