import { z } from "zod";
import { cnpjRegex, cpfRegex } from "@/lib/validators";
import { createZodResolver } from "@/lib/zodResolver";

export const avaliadorSchema = z.object({
	nome: z.string().trim().min(1, "Informe o nome."),
	nomeFantasia: z.string().trim().min(1, "Informe o nome fantasia."),
	cpf: z.string().trim().regex(cpfRegex, "Informe o CPF com máscara: 000.000.000-00."),
	cnpj: z.string().trim().regex(cnpjRegex, "Informe o CNPJ com máscara: 00.000.000/0000-00."),
	registroCrea: z
		.string()
		.trim()
		.min(1, "Informe o registro CREA.")
		.max(25, "Máximo 25 caracteres."),
});

export type AvaliadorFormValues = z.infer<typeof avaliadorSchema>;

export const avaliadorFormResolver = createZodResolver(avaliadorSchema);

export const defaultAvaliadorValues: AvaliadorFormValues = {
	nome: "",
	nomeFantasia: "",
	cpf: "",
	cnpj: "",
	registroCrea: "",
};
