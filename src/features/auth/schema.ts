import { z } from "zod";
import { createZodResolver } from "@/lib/zodResolver";

export const loginSchema = z.object({
	email: z.string().trim().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
	senha: z.string().min(1, "Informe a senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginFormResolver = createZodResolver(loginSchema);

export const defaultLoginValues: LoginFormValues = {
	email: "",
	senha: "",
};
