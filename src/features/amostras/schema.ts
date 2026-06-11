import { z } from "zod";
import { cepRegex, cnpjRegex, cpfRegex, dddRegex, phoneRegex } from "@/lib/validators";
import { createZodResolver } from "@/lib/zodResolver";
import {
	type AmostraFormValues,
	type ArrayValue,
	INCIDENCIA_SUM_TARGET,
	INCIDENCIA_SUM_TOLERANCE,
	incidenciaServicos,
	integerFields,
	positiveNumberFields,
	requiredFields,
	type TextField,
	textFields,
} from "./fields";

const twoDecimalRegex = /^\d+(?:[,.]\d{2})$/;

function positiveNumberString(field: TextField) {
	if (integerFields.has(field)) {
		return z.string().refine(
			(value) => {
				if (!value.trim()) return true;
				const parsed = Number(value);
				return Number.isInteger(parsed) && parsed >= 0;
			},
			{ message: "Informe um número inteiro." },
		);
	}
	return z.string().refine(
		(value) => {
			if (!value.trim()) return !requiredFields.has(field);
			const parsed = Number(value.replace(",", "."));
			return Number.isFinite(parsed) && parsed >= 0;
		},
		{
			message: requiredFields.has(field) ? "Preencha este campo." : "Informe um número positivo.",
		},
	);
}

function textFieldSchema(field: TextField) {
	if (field === "cpf") {
		return z
			.string()
			.trim()
			.min(1, "Informe o CPF.")
			.regex(cpfRegex, "Informe o CPF com máscara: 000.000.000-00.");
	}
	if (field === "cnpj") {
		return z
			.string()
			.trim()
			.min(1, "Informe o CNPJ.")
			.regex(cnpjRegex, "Informe o CNPJ com máscara: 00.000.000/0000-00.");
	}
	if (field === "cep") {
		return z
			.string()
			.trim()
			.min(1, "Informe o CEP.")
			.regex(cepRegex, "Informe o CEP com máscara: 00000-000.");
	}
	if (positiveNumberFields.has(field)) return positiveNumberString(field);
	if (requiredFields.has(field)) return z.string().trim().min(1, "Preencha este campo.");
	return z.string();
}

const textFieldShape = Object.fromEntries(
	textFields.map((field) => [field, textFieldSchema(field)]),
) as unknown as Record<TextField, z.ZodType<string>>;

const decimalArrayValueSchema = z.object({
	value: z.string().refine((value) => !value.trim() || twoDecimalRegex.test(value.trim()), {
		message: "Informe um número positivo com duas casas decimais.",
	}),
});

function hasDecimalArrayValue(values: ArrayValue[]) {
	return values.some((item) => {
		const value = item.value.trim();
		return value !== "" && twoDecimalRegex.test(value);
	});
}

function sumArrayValues(values: ArrayValue[]) {
	return values.reduce((acc, item) => {
		const normalized = item.value.trim().replace(",", ".");
		const parsed = Number(normalized);
		return acc + (normalized && Number.isFinite(parsed) ? parsed : 0);
	}, 0);
}

function incidenciasSumValid(values: ArrayValue[]) {
	return Math.abs(sumArrayValues(values) - INCIDENCIA_SUM_TARGET) <= INCIDENCIA_SUM_TOLERANCE;
}

export const amostraFormSchema: z.ZodType<AmostraFormValues> = z.object({
	avaliadorId: z.string().min(1, "Selecione um avaliador."),
	ddd: z.string().regex(dddRegex, "Use 2 dígitos."),
	telefone: z.string().regex(phoneRegex, "Informe o telefone com máscara: 00000-0000."),
	incidencias: z
		.array(decimalArrayValueSchema)
		.length(incidenciaServicos.length)
		.refine(incidenciasSumValid, "A soma dos pesos deve totalizar 100%."),
	acumuladoProposto: z
		.array(decimalArrayValueSchema)
		.min(1)
		.refine(hasDecimalArrayValue, "Informe ao menos um valor decimal."),
	...textFieldShape,
});

export const amostraFormResolver = createZodResolver(amostraFormSchema);
