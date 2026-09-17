import type { CreateAmostraInput } from "@/lib/api";

export type ArrayValue = {
	value: string;
};

export type AmostraFormValues = Omit<
	Record<keyof CreateAmostraInput, string>,
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

// Um registro por campo. Validação, máscara, parse, renderização e formatação
// de exibição são derivados daqui; adicionar um campo é adicionar uma entrada.
export type FieldKind =
	| "text"
	| "textarea"
	| "cpf"
	| "cnpj"
	| "cep"
	| "uf"
	| "coordenada"
	| "money"
	| "area"
	| "meter"
	| "integer"
	| "decimal"
	| "enum"
	| "date"
	| "municipio";

export type FieldSpec = {
	label: string;
	kind: FieldKind;
	required?: boolean;
	options?: readonly string[];
	placeholder?: string;
};

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

export const fieldSpecs: Record<TextField, FieldSpec> = {
	proponente: { label: "Proponente", kind: "text" },
	cpf: { label: "CPF", kind: "cpf", required: true, placeholder: "000.000.000-00" },
	cnpj: { label: "CNPJ", kind: "cnpj", placeholder: "00.000.000/0000-00" },
	endereco: { label: "Endereço", kind: "text" },
	coordenadaS: { label: "Coordenada S", kind: "coordenada", placeholder: "05º39'05,497\"" },
	coordenadaW: { label: "Coordenada W", kind: "coordenada", placeholder: "40º31'12,209\"" },
	complemento: { label: "Complemento", kind: "text" },
	bairro: { label: "Bairro", kind: "text" },
	cep: { label: "CEP", kind: "cep", required: true, placeholder: "00000-000" },
	municipio: { label: "Município", kind: "municipio" },
	uf: { label: "UF", kind: "uf", placeholder: "CE" },
	empresaResponsavel: { label: "Empresa responsável", kind: "text" },
	valorTerreno: { label: "Valor do terreno", kind: "money" },
	matricula: { label: "Matrícula", kind: "text" },
	oficio: { label: "Ofício", kind: "text" },
	comarca: { label: "Comarca", kind: "text" },
	ufMatricula: { label: "UF da matrícula", kind: "uf", placeholder: "CE" },
	valorImovel: { label: "Valor do imóvel", kind: "money" },
	numeroEtapas: { label: "Número de etapas", kind: "integer" },
	valorUnitario: { label: "Valor unitário", kind: "money" },
	testada: { label: "Testada", kind: "meter" },
	idadeEstimada: { label: "Idade estimada", kind: "text" },
	areaTerreno: { label: "Área do terreno", kind: "area" },
	areaConstruida: { label: "Área construída", kind: "area" },
	quartos: { label: "Quartos", kind: "integer" },
	banheiros: { label: "Banheiros", kind: "integer" },
	suites: { label: "Suítes", kind: "integer" },
	vagas: { label: "Vagas", kind: "integer" },
	padraoAcabamento: {
		label: "Padrão de acabamento",
		kind: "enum",
		options: padraoAcabamentoOptions,
	},
	estadoConservacao: {
		label: "Estado de conservação",
		kind: "enum",
		options: estadoConservacaoOptions,
	},
	infraestrutura: { label: "Infraestrutura", kind: "text" },
	servicosPublicos: { label: "Serviços públicos", kind: "text" },
	usosPredominantes: { label: "Usos predominantes", kind: "text" },
	viaAcesso: { label: "Via de acesso", kind: "text" },
	regiaoContexto: { label: "Região no contexto urbano", kind: "text" },
	equacaoSISDEA: { label: "Equação SISDEA", kind: "textarea" },
	dataReferencia: { label: "Data de referência", kind: "date", required: true },
};

// Campos numéricos digitados com máscara decimal (1.234,56).
export function isMaskedDecimalKind(kind: FieldKind) {
	return kind === "money" || kind === "area" || kind === "meter" || kind === "decimal";
}

export function isNumberKind(kind: FieldKind) {
	return kind === "integer" || isMaskedDecimalKind(kind);
}

export function getInputMode(field: TextField) {
	const { kind } = fieldSpecs[field];
	if (isNumberKind(kind) || kind === "cpf" || kind === "cnpj" || kind === "cep") return "numeric";
	return "text";
}

export const incidenciaServicos = [
	"Serviços preliminares e gerais",
	"Infraestrutura",
	"Supraestrutura",
	"Paredes e painéis",
	"Esquadrias",
	"Vidros e Plásticos",
	"Coberturas",
	"Impermeabilizações",
	"Revestimentos Internos",
	"Forros",
	"Revestimentos Externos",
	"Pintura",
	"Pisos",
	"Acabamentos",
	"Instalações Elétricas e Telefônicas",
	"Instalações Hidráulicas",
	"Instalações de Esgoto e Águas Pluviais",
	"Louças e Metais",
	"Complementos",
	"Outros Serviços",
] as const;

export const INCIDENCIA_SUM_TARGET = 100;
export const INCIDENCIA_SUM_TOLERANCE = 0.05;

export const identificationGroupTitle = "Identificação";

export const fieldGroups = [
	{
		title: identificationGroupTitle,
		description: "Dados principais da amostra e do proponente.",
		fields: ["proponente", "cpf", "cnpj"] satisfies TextField[],
	},
	{
		title: "Localização",
		description: "Endereço, coordenadas e município.",
		fields: [
			"endereco",
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
		description: "Valores do terreno, imóvel e unitário.",
		fields: ["valorTerreno", "valorImovel", "numeroEtapas", "valorUnitario"] satisfies TextField[],
	},
	{
		title: "Características",
		description: "Medidas e composição do imóvel.",
		fields: ["testada", "idadeEstimada", "areaTerreno", "areaConstruida"] satisfies TextField[],
	},
	{
		title: "Distribuição",
		description: "Quantidade de cômodos e vagas.",
		fields: ["quartos", "banheiros", "suites", "vagas"] satisfies TextField[],
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
			"equacaoSISDEA",
		] satisfies TextField[],
	},
	{
		title: "Controle",
		description: "Data de referência da avaliação.",
		fields: ["dataReferencia"] satisfies TextField[],
	},
];

export const textFields = Object.keys(fieldSpecs) as TextField[];

export const defaultValues: AmostraFormValues = {
	avaliadorId: "",
	ddd: "",
	telefone: "",
	incidencias: incidenciaServicos.map(() => ({ value: "" })),
	acumuladoProposto: [{ value: "" }],
	...(Object.fromEntries(textFields.map((field) => [field, ""])) as Record<TextField, string>),
};
