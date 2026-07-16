import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";
import { type AuthUser, login as loginRequest, me } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth";
import { queryKeys } from "@/lib/queryKeys";

type AuthContextValue = {
	user: AuthUser | null;
	isLoading: boolean;
	login: (email: string, senha: string) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [hasToken, setHasToken] = useState(() => getToken() !== null);

	const { data: user, isLoading } = useQuery<AuthUser>({
		queryKey: queryKeys.me,
		queryFn: me,
		enabled: hasToken,
		retry: false,
	});

	async function login(email: string, senha: string) {
		const { token } = await loginRequest({ email, senha });
		setToken(token);
		setHasToken(true);
		await queryClient.invalidateQueries({ queryKey: queryKeys.me });
	}

	function logout() {
		clearToken();
		setHasToken(false);
		queryClient.removeQueries({ queryKey: queryKeys.me });
		window.location.href = "/login";
	}

	return (
		<AuthContext.Provider
			value={{ user: user ?? null, isLoading: hasToken && isLoading, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}
