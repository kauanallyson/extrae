import type { CreateAmostraInput } from "@/lib/api";
import { formatBrl, formatDecimal } from "@/lib/format";
import {
	maskCep,
	maskDecimal,
	maskTelefone,
	normalizeCoordenadaDms,
	unmaskDecimal,
} from "@/lib/validators";
import {
	type AmostraFormValues,
	type ArrayValue,
	fieldSpecs,
	incidenciaServicos,
	isMaskedDecimalKind,
	type TextField,
	textFields,
} from "./fields";

function parseFixedNumberArray(values: ArrayValue[]) {
	return values.map((item) => {
		const trimmed = item.value.trim();
		if (!trimmed) return 0;
		const parsed = Number(unmaskDecimal(trimmed));
		return Number.isFinite(parsed) ? parsed : 0;
	});
}

function parseNumberArray(values: ArrayValue[]) {
	return values
		.map((item) => item.value.trim())
		.filter(Boolean)
		.map((value) => Number(unmaskDecimal(value)))
		.filter((item) => Number.isFinite(item));
}

function nullableArray<T>(values: T[]): T[] | null {
	return values.length > 0 ? values : null;
}

function maskedArrayValue(value: number | null | undefined): string {
	return value != null ? maskDecimal(value.toFixed(2)) : "";
}

// O que o usuário digita passa por aqui a cada tecla; a mesma máscara é usada
// ao carregar um valor do servidor, então o formulário nunca vê dois formatos.
export function maskTextField(field: TextField, value: string): string {
	const { kind } = fieldSpecs[field];
	if (kind === "cep") return maskCep(value);
	if (kind === "coordenada") return normalizeCoordenadaDms(value);
	if (isMaskedDecimalKind(kind)) return maskDecimal(value);
	return value;
}

function textFieldToFormValue(field: TextField, value: string | number | null): string {
	if (value == null) return "";
	const { kind } = fieldSpecs[field];
	if (isMaskedDecimalKind(kind)) return maskedArrayValue(Number(value));
	if (kind === "integer") return String(value);
	return maskTextField(field, String(value));
}

function parseTextField(field: TextField, value: string): string | number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const { kind } = fieldSpecs[field];
	if (kind === "integer") {
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}
	if (isMaskedDecimalKind(kind)) {
		const parsed = Number(unmaskDecimal(trimmed));
		return Number.isFinite(parsed) ? parsed : null;
	}
	return trimmed;
}

// Exibição na página de detalhes: mesma fonte de verdade para unidade e formato.
export function formatTextField(field: TextField, value: string | number | null): string {
	if (value == null || value === "") return "-";
	const { kind } = fieldSpecs[field];
	if (kind === "money") return formatBrl(Number(value));
	if (kind === "area") return `${formatDecimal(Number(value))} m²`;
	if (kind === "meter") return `${formatDecimal(Number(value))} m`;
	return String(value) || "-";
}

export function amostraToFormValues(amostra: CreateAmostraInput): AmostraFormValues {
	const incidencias = amostra.incidencias ?? [];
	const acumuladoProposto = amostra.acumuladoProposto ?? [];
	const text = Object.fromEntries(
		textFields.map((field) => [field, textFieldToFormValue(field, amostra[field])]),
	) as Record<TextField, string>;
	return {
		avaliadorId: amostra.avaliadorId ? String(amostra.avaliadorId) : "",
		ddd: amostra.ddd ?? "",
		telefone: maskTelefone(amostra.telefone ?? ""),
		incidencias: incidenciaServicos.map((_, i) => ({
			value: maskedArrayValue(incidencias[i]),
		})),
		acumuladoProposto:
			acumuladoProposto.length > 0
				? acumuladoProposto.map((v) => ({ value: maskedArrayValue(v) }))
				: [{ value: "" }],
		...text,
	};
}

export function parseFormValues(values: AmostraFormValues): CreateAmostraInput {
	const text = Object.fromEntries(
		textFields.map((field) => [field, parseTextField(field, values[field])]),
	) as Omit<
		CreateAmostraInput,
		"avaliadorId" | "ddd" | "telefone" | "incidencias" | "acumuladoProposto"
	>;
	return {
		avaliadorId: Number(values.avaliadorId),
		ddd: values.ddd.replace(/\D/g, "") || null,
		telefone: values.telefone.replace(/\D/g, "") || null,
		incidencias: nullableArray(parseFixedNumberArray(values.incidencias)),
		acumuladoProposto: nullableArray(parseNumberArray(values.acumuladoProposto)),
		...text,
	};
}
