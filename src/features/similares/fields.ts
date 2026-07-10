import { z } from "zod";
import type { AmostraSimilaresCriterios } from "@/lib/api";
import { coordenadaDmsMessage, coordenadaDmsRegex, dataReferenciaRegex } from "@/lib/validators";
import { createZodResolver } from "@/lib/zodResolver";

export const padraoAcabamentoOptions = [
	"Mínimo",
	"Baixo",
	"Normal (c/ aspectos de baixo)",
	"Normal (forte predominância)",
	"Normal (c/ aspectos de alto)",
	"Alto (por predominância)",
	"Alto (superior, luxo)",
] as const;

export const estadoConservacaoOptions = [
	"Em construção ou na planta",
	"Bom (aparência de novo)",
	"Bom (aparência de usado)",
	"Regular (reparos simples)",
	"Regular (reparos importantes)",
	"Ruim",
] as const;

export const similaresFormSchema = z.object({
	coordenadaS: z
		.string()
		.min(1, "Informe a coordenada S.")
		.regex(coordenadaDmsRegex, coordenadaDmsMessage),
	coordenadaW: z
		.string()
		.min(1, "Informe a coordenada W.")
		.regex(coordenadaDmsRegex, coordenadaDmsMessage),
	areaTerreno: z.string(),
	areaConstruida: z.string(),
	padraoAcabamento: z.string(),
	estadoConservacao: z.string(),
	dataReferencia: z
		.string()
		.refine((value) => value.trim() === "" || dataReferenciaRegex.test(value.trim()), {
			message: "Use o formato DD/MM/AAAA.",
		}),
	raioKm: z.string(),
	limit: z.string(),
});

export type SimilaresFormValues = z.infer<typeof similaresFormSchema>;

export const similaresFormResolver = createZodResolver(similaresFormSchema);

export const defaultValues: SimilaresFormValues = {
	coordenadaS: "",
	coordenadaW: "",
	areaTerreno: "",
	areaConstruida: "",
	padraoAcabamento: "",
	estadoConservacao: "",
	dataReferencia: "",
	raioKm: "5",
	limit: "50",
};

function toNumberOrNull(value: string): number | null {
	const trimmed = value.trim().replace(",", ".");
	return trimmed === "" ? null : Number(trimmed);
}

export function parseSimilaresForm(values: SimilaresFormValues): {
	criterios: AmostraSimilaresCriterios;
	options: { raioKm?: number; limit?: number };
} {
	return {
		criterios: {
			coordenadaS: values.coordenadaS.trim(),
			coordenadaW: values.coordenadaW.trim(),
			areaTerreno: toNumberOrNull(values.areaTerreno),
			areaConstruida: toNumberOrNull(values.areaConstruida),
			padraoAcabamento: values.padraoAcabamento || null,
			estadoConservacao: values.estadoConservacao || null,
			dataReferencia: values.dataReferencia.trim() || null,
		},
		options: {
			raioKm: values.raioKm.trim() === "" ? undefined : Number(values.raioKm),
			limit: values.limit.trim() === "" ? undefined : Number(values.limit),
		},
	};
}
