import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";
import {
	defaultLoginValues,
	type LoginFormValues,
	loginFormResolver,
} from "@/features/auth/schema";
import { fieldInputClassName } from "@/lib/formStyles";
import { getErrorMessage } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [isPending, setIsPending] = useState(false);

	const form = useForm<LoginFormValues>({
		defaultValues: defaultLoginValues,
		resolver: loginFormResolver,
	});

	async function onSubmit(values: LoginFormValues) {
		setIsPending(true);
		try {
			await login(values.email.trim(), values.senha);
			navigate("/", { replace: true });
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="dark flex min-h-dvh w-full items-center justify-center bg-slate-900 px-4 text-slate-100">
			<div className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-800 p-6 shadow-2xl shadow-black/30">
				<div className="mb-6 flex items-center gap-3">
					<Logo />
					<span className="text-sm font-semibold tracking-[0.28em] text-slate-100">EXTRAE</span>
				</div>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label htmlFor="login-email" className="mb-1 block text-sm text-slate-300">
							E-mail
						</label>
						<Input
							id="login-email"
							type="email"
							{...form.register("email")}
							className={fieldInputClassName}
							placeholder="voce@exemplo.com"
							disabled={isPending}
						/>
						<FieldError message={form.formState.errors.email?.message} />
					</div>

					<div>
						<label htmlFor="login-senha" className="mb-1 block text-sm text-slate-300">
							Senha
						</label>
						<Input
							id="login-senha"
							type="password"
							{...form.register("senha")}
							className={fieldInputClassName}
							placeholder="••••••••"
							disabled={isPending}
						/>
						<FieldError message={form.formState.errors.senha?.message} />
					</div>

					<Button
						type="submit"
						disabled={isPending}
						className="h-10 w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
					>
						{isPending ? (
							<>
								<LoaderCircleIcon className="h-4 w-4 animate-spin" />
								Entrando...
							</>
						) : (
							"Entrar"
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
