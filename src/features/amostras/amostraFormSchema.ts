import type { FieldError, Resolver } from "react-hook-form";
import { z } from "zod";
import type { CreateAmostraInput } from "@/lib/api";

type NewAmostraRequest = CreateAmostraInput;

export type ArrayValue = {
	value: string;
};

export type AmostraFormValues = Omit<
	Record<keyof NewAmostraRequest, string>,
	"avaliadorId" | "ddd" | "telefone" | "incidencias" | "acumuladoProposto"
> & {
	avaliadorId: string;
	ddd: string;
	telefone: string;
	incidencias: ArrayValue[];
	acumuladoProposto: ArrayValue[];
};

export type TextField = Exclude<
	keyof AmostraFormValues,
	"avaliadorId" | "ddd" | "telefone" | "incidencias" | "acumuladoProposto"
>;

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cepRegex = /^\d{5}-\d{3}$/;
export const dddRegex = /^\d{2}$/;
export const phoneRegex = /^\d{4,5}-\d{4}$/;
const twoDecimalRegex = /^\d+(?:[,.]\d{2})$/;

export const moneyFields = new Set<TextField>(["valorTerreno", "valorImovel", "valorUnitario"]);
export const areaFields = new Set<TextField>(["areaTerreno", "areaConstruida"]);
const requiredFields = new Set<TextField>(["cpf", "cnpj", "cep", "dataReferencia"]);
export const positiveNumberFields = new Set<TextField>([
	"valorTerreno",
	"valorImovel",
	"numeroEtapas",
	"valorUnitario",
	"testada",
	"areaTerreno",
	"areaConstruida",
	"quartos",
	"banheiros",
	"suites",
	"vagas",
]);

export const fieldInputClassName =
	"h-10 rounded-md border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-500 hover:bg-slate-700 focus-visible:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";
export const secondaryButtonClassName =
	"border-slate-600 bg-slate-800 text-slate-100 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-50";

export const fieldLabels: Record<TextField, string> = {
	proponente: "Proponente",
	cpf: "CPF",
	cnpj: "CNPJ",
	enderecoLiteral: "Endereço",
	coordenadaS: "Coordenada S",
	coordenadaW: "Coordenada W",
	complemento: "Complemento",
	bairro: "Bairro",
	cep: "CEP",
	municipio: "Município",
	uf: "UF",
	empresaResponsavel: "Empresa responsável",
	valorTerreno: "Valor do terreno",
	matricula: "Matrícula",
	oficio: "Ofício",
	comarca: "Comarca",
	ufMatricula: "UF da matrícula",
	valorImovel: "Valor do imóvel",
	numeroEtapas: "Número de etapas",
	valorUnitario: "Valor unitário",
	testada: "Testada",
	idadeEstimada: "Idade estimada",
	areaTerreno: "Área do terreno",
	areaConstruida: "Área construída",
	quartos: "Quartos",
	banheiros: "Banheiros",
	suites: "Suítes",
	vagas: "Vagas",
	padraoAcabamento: "Padrão de acabamento",
	estadoConservacao: "Estado de conservação",
	infraestrutura: "Infraestrutura",
	servicosPublicos: "Serviços públicos",
	usosPredominantes: "Usos predominantes",
	viaAcesso: "Via de acesso",
	regiaoContexto: "Região e contexto",
	dataReferencia: "Data de referência",
};

export const fieldGroups = [
	{
		title: "Identificação",
		description: "Dados principais da amostra e do proponente.",
		fields: ["proponente", "cpf", "cnpj"] satisfies TextField[],
	},
	{
		title: "Localização",
		description: "Endereço, coordenadas e município.",
		fields: [
			"enderecoLiteral",
			"coordenadaS",
			"coordenadaW",
			"complemento",
			"bairro",
			"cep",
			"municipio",
			"uf",
		] satisfies TextField[],
	},
	{
		title: "Registro",
		description: "Informações cartoriais e responsáveis.",
		fields: [
			"empresaResponsavel",
			"matricula",
			"oficio",
			"comarca",
			"ufMatricula",
		] satisfies TextField[],
	},
	{
		title: "Valores",
		description: "Valores e etapas usadas na avaliação.",
		fields: ["valorTerreno", "valorImovel", "numeroEtapas", "valorUnitario"] satisfies TextField[],
	},
	{
		title: "Características",
		description: "Medidas e composição do imóvel.",
		fields: [
			"testada",
			"idadeEstimada",
			"areaTerreno",
			"areaConstruida",
			"quartos",
			"banheiros",
			"suites",
			"vagas",
		] satisfies TextField[],
	},
	{
		title: "Contexto",
		description: "Padrão, conservação, infraestrutura e entorno.",
		fields: [
			"padraoAcabamento",
			"estadoConservacao",
			"infraestrutura",
			"servicosPublicos",
			"usosPredominantes",
			"viaAcesso",
			"regiaoContexto",
		] satisfies TextField[],
	},
	{
		title: "Controle",
		description: "Data de referência da avaliação.",
		fields: ["dataReferencia"] satisfies TextField[],
	},
];

const textFields = fieldGroups.flatMap((group) => group.fields);

export const defaultValues = {
	avaliadorId: "",
	ddd: "",
	telefone: "",
	incidencias: [{ value: "" }],
	acumuladoProposto: [{ value: "" }],
	...Object.fromEntries(textFields.map((field) => [field, ""])),
} as AmostraFormValues;

export function getPlaceholder(field: TextField) {
	if (field === "cpf") return "000.000.000-00";
	if (field === "cnpj") return "00.000.000/0000-00";
	if (field === "cep") return "00000-000";
	if (field === "uf" || field === "ufMatricula") return "CE";
	if (field === "coordenadaS") return "5°22'18.3\"S";
	if (field === "coordenadaW") return "39°29'34.4\"W";
	return undefined;
}

export function getInputMode(field: TextField) {
	if (positiveNumberFields.has(field)) return "decimal";
	if (field === "cpf" || field === "cnpj" || field === "cep") return "numeric";
	return "text";
}

function positiveNumberString(field: TextField) {
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

export const amostraFormSchema: z.ZodType<AmostraFormValues> = z.object({
	avaliadorId: z.string().min(1, "Selecione um avaliador."),
	ddd: z.string().regex(dddRegex, "Use 2 dígitos."),
	telefone: z.string().regex(phoneRegex, "Informe o telefone com máscara: 00000-0000."),
	incidencias: z
		.array(decimalArrayValueSchema)
		.min(1)
		.refine(hasDecimalArrayValue, "Informe ao menos um valor decimal."),
	acumuladoProposto: z
		.array(decimalArrayValueSchema)
		.min(1)
		.refine(hasDecimalArrayValue, "Informe ao menos um valor decimal."),
	...textFieldShape,
});

type ErrorNode = Record<string, unknown>;

function assignFieldError(errors: ErrorNode, path: PropertyKey[], message: string) {
	let cursor = errors;
	for (const segment of path.slice(0, -1)) {
		const key = String(segment);
		cursor[key] = (cursor[key] as ErrorNode | undefined) ?? {};
		cursor = cursor[key] as ErrorNode;
	}

	const key = String(path.at(-1));
	cursor[key] = { type: "validation", message } satisfies FieldError;
}

export const amostraFormResolver: Resolver<AmostraFormValues> = async (values) => {
	const result = amostraFormSchema.safeParse(values);
	if (result.success) return { values: result.data, errors: {} };

	const errors: ErrorNode = {};
	for (const issue of result.error.issues) {
		assignFieldError(errors, issue.path, issue.message);
	}

	return { values: {}, errors };
};

function parsePositiveNumber(value: string) {
	return Number(value.trim().replace(",", ".") || 0);
}

function parseNumberArray(values: ArrayValue[]) {
	return values
		.map((item) => item.value.trim().replace(",", "."))
		.filter(Boolean)
		.map(Number)
		.filter((item) => Number.isFinite(item));
}

export function parseFormValues(values: AmostraFormValues): NewAmostraRequest {
	return {
		avaliadorId: Number(values.avaliadorId),
		proponente: values.proponente.trim(),
		cpf: values.cpf.trim(),
		cnpj: values.cnpj.trim(),
		ddd: values.ddd.replace(/\D/g, ""),
		telefone: values.telefone.replace(/\D/g, ""),
		enderecoLiteral: values.enderecoLiteral.trim(),
		coordenadaS: values.coordenadaS.trim(),
		coordenadaW: values.coordenadaW.trim(),
		complemento: values.complemento.trim(),
		bairro: values.bairro.trim(),
		cep: values.cep.trim(),
		municipio: values.municipio.trim(),
		uf: values.uf.trim(),
		empresaResponsavel: values.empresaResponsavel.trim(),
		valorTerreno: parsePositiveNumber(values.valorTerreno),
		matricula: values.matricula.trim(),
		oficio: values.oficio.trim(),
		comarca: values.comarca.trim(),
		ufMatricula: values.ufMatricula.trim(),
		valorImovel: parsePositiveNumber(values.valorImovel),
		incidencias: parseNumberArray(values.incidencias),
		numeroEtapas: parsePositiveNumber(values.numeroEtapas),
		acumuladoProposto: parseNumberArray(values.acumuladoProposto),
		valorUnitario: parsePositiveNumber(values.valorUnitario),
		testada: parsePositiveNumber(values.testada),
		idadeEstimada: values.idadeEstimada.trim(),
		areaTerreno: parsePositiveNumber(values.areaTerreno),
		areaConstruida: parsePositiveNumber(values.areaConstruida),
		quartos: parsePositiveNumber(values.quartos),
		banheiros: parsePositiveNumber(values.banheiros),
		suites: parsePositiveNumber(values.suites),
		vagas: parsePositiveNumber(values.vagas),
		padraoAcabamento: values.padraoAcabamento.trim(),
		estadoConservacao: values.estadoConservacao.trim(),
		infraestrutura: values.infraestrutura.trim(),
		servicosPublicos: values.servicosPublicos.trim(),
		usosPredominantes: values.usosPredominantes.trim(),
		viaAcesso: values.viaAcesso.trim(),
		regiaoContexto: values.regiaoContexto.trim(),
		dataReferencia: values.dataReferencia,
	};
}
