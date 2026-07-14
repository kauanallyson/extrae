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

export const moneyFields = new Set<TextField>(["valorTerreno", "valorImovel", "valorUnitario"]);
export const areaFields = new Set<TextField>(["areaTerreno", "areaConstruida"]);
export const meterFields = new Set<TextField>(["testada"]);
export const integerFields = new Set<TextField>(["quartos", "banheiros", "suites", "vagas"]);
export const roundedDecimalFields = new Set<TextField>([
	"valorTerreno",
	"valorImovel",
	"valorUnitario",
	"testada",
	"areaTerreno",
	"areaConstruida",
]);
export const requiredFields = new Set<TextField>(["cpf", "cep", "dataReferencia"]);

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

export const enumFieldOptions: Partial<Record<TextField, readonly string[]>> = {
	padraoAcabamento: padraoAcabamentoOptions,
	estadoConservacao: estadoConservacaoOptions,
};
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

export const fieldLabels: Record<TextField, string> = {
	proponente: "Proponente",
	cpf: "CPF",
	cnpj: "CNPJ",
	endereco: "Endereço",
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
	regiaoContexto: "Região no contexto urbano",
	dataReferencia: "Data de referência",
};

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

export const INCIDENCIA_SUM_TARGET = 10000;
export const INCIDENCIA_SUM_TOLERANCE = 5;

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
		] satisfies TextField[],
	},
	{
		title: "Controle",
		description: "Data de referência da avaliação.",
		fields: ["dataReferencia"] satisfies TextField[],
	},
];

export const textFields = fieldGroups.flatMap((group) => group.fields);

export const defaultValues = {
	avaliadorId: "",
	ddd: "",
	telefone: "",
	incidencias: incidenciaServicos.map(() => ({ value: "" })),
	acumuladoProposto: [{ value: "" }],
	...Object.fromEntries(textFields.map((field) => [field, ""])),
} as AmostraFormValues;

export function getPlaceholder(field: TextField) {
	if (field === "cpf") return "000.000.000-00";
	if (field === "cnpj") return "00.000.000/0000-00";
	if (field === "cep") return "00.000-000";
	if (field === "uf" || field === "ufMatricula") return "CE";
	if (field === "coordenadaS") return "05º39'05,497\"";
	if (field === "coordenadaW") return "40º31'12,209\"";
	return undefined;
}

export function getInputMode(field: TextField) {
	if (integerFields.has(field) || roundedDecimalFields.has(field)) return "numeric";
	if (positiveNumberFields.has(field)) return "decimal";
	if (field === "cpf" || field === "cnpj" || field === "cep") return "numeric";
	return "text";
}
