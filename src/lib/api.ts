import { getToken } from "@/lib/auth";

// Sempre same-origin: em dev o proxy do Vite e no Vercel o rewrite do vercel.json
// encaminham /api para o servidor. Chamar o servidor direto barra os previews do
// Vercel no CORS, que só libera o domínio de produção.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Quem monta a app decide o que fazer quando a sessão expira (limpar cache,
// navegar para o login). O transporte só avisa.
let onUnauthorized: () => void = () => {};

export function setOnUnauthorized(handler: () => void): void {
	onUnauthorized = handler;
}

async function readErrorMessage(res: Response): Promise<string> {
	try {
		const body = await res.json();
		return body?.message ?? res.statusText;
	} catch {
		return (await res.text().catch(() => res.statusText)) || res.statusText;
	}
}

type RequestOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	auth?: boolean;
};

// Único ponto de saída para o servidor: cabeçalho de auth, checagem de ok,
// mensagem de erro e política de 401 vivem aqui.
async function request(
	path: string,
	errorPrefix: string,
	{ method = "GET", body, auth = true }: RequestOptions = {},
): Promise<Response> {
	const headers: Record<string, string> = {};
	const token = auth ? getToken() : null;
	if (token) headers.Authorization = `Bearer ${token}`;

	let payload: BodyInit | undefined;
	if (body instanceof FormData) {
		payload = body;
	} else if (body !== undefined) {
		headers["Content-Type"] = "application/json";
		payload = JSON.stringify(body);
	}

	const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
	if (res.ok) return res;
	if (res.status === 401) onUnauthorized();
	throw new Error(`${errorPrefix}: ${await readErrorMessage(res)}`);
}

async function requestJson<T>(path: string, errorPrefix: string, options?: RequestOptions) {
	const res = await request(path, errorPrefix, options);
	return res.json() as Promise<T>;
}

function contentDispositionFilename(res: Response, fallback: string): string {
	const disposition = res.headers.get("Content-Disposition");
	if (!disposition) return fallback;

	// RFC 5987 encoded filename (filename*=UTF-8''...) takes precedence
	const encoded = disposition.match(/filename\*\s*=\s*utf-8''([^;]+)/i);
	if (encoded) {
		try {
			return decodeURIComponent(encoded[1].trim());
		} catch {
			// fall back to the plain filename parameter
		}
	}

	const plain = disposition.match(/filename\s*=\s*(?:"([^"]*)"|([^;\s]+))/);
	return plain?.[1] || plain?.[2] || fallback;
}

async function requestFile(
	path: string,
	errorPrefix: string,
	fallbackFilename: string,
): Promise<DownloadFile> {
	const res = await request(path, errorPrefix);
	return { blob: await res.blob(), filename: contentDispositionFilename(res, fallbackFilename) };
}

function withQuery(path: string, query: URLSearchParams): string {
	const qs = query.toString();
	return qs ? `${path}?${qs}` : path;
}

export type AuthUser = {
	id: number;
	nome: string;
	email: string;
};

export type LoginInput = { email: string; senha: string };

export type Avaliador = {
	id: number;
	nome: string;
	nomeFantasia: string;
	cpf: string;
	cnpj: string;
	registroCrea: string;
};

export type Amostra = {
	id: number;
	avaliadorId: number;
	proponente: string | null;
	cpf: string | null;
	cnpj: string | null;
	ddd: string | null;
	telefone: string | null;
	endereco: string | null;
	coordenadaS: string | null;
	coordenadaW: string | null;
	complemento: string | null;
	bairro: string | null;
	cep: string | null;
	municipio: string | null;
	uf: string | null;
	empresaResponsavel: string | null;
	valorTerreno: number | null;
	matricula: string | null;
	oficio: string | null;
	comarca: string | null;
	ufMatricula: string | null;
	valorImovel: number | null;
	incidencias: number[] | null;
	numeroEtapas: number | null;
	acumuladoProposto: number[] | null;
	valorUnitario: number | null;
	testada: number | null;
	idadeEstimada: string | null;
	areaTerreno: number | null;
	areaConstruida: number | null;
	quartos: number | null;
	banheiros: number | null;
	suites: number | null;
	vagas: number | null;
	padraoAcabamento: string | null;
	estadoConservacao: string | null;
	infraestrutura: string | null;
	servicosPublicos: string | null;
	usosPredominantes: string | null;
	viaAcesso: string | null;
	regiaoContexto: string | null;
	equacaoSISDEA: string | null;
	dataReferencia: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateAmostraInput = Omit<Amostra, "id" | "createdAt" | "updatedAt">;

export type CreateAvaliadorInput = Omit<Avaliador, "id">;

export type DownloadFile = { blob: Blob; filename: string };

export type AmostrasPage = {
	data: Amostra[];
	nextCursor: number | null;
};

export type AmostraTipo = "imovel" | "terreno";

export type AmostrasFilters = {
	tipo?: AmostraTipo;
	municipio?: string;
	uf?: string;
	from?: string;
	to?: string;
	valorImovelMin?: string;
	valorImovelMax?: string;
	valorTerrenoMin?: string;
	valorTerrenoMax?: string;
};

const upperFilterKeys = new Set<keyof AmostrasFilters>(["municipio", "uf"]);

// Única codificação dos filtros para a query string: município e UF vão em maiúsculas.
export function amostrasFilterParams(filters: AmostrasFilters): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		let trimmed = value?.trim();
		if (!trimmed) continue;
		if (upperFilterKeys.has(key as keyof AmostrasFilters)) trimmed = trimmed.toUpperCase();
		params.set(key, trimmed);
	}
	return params;
}

export async function login(input: LoginInput): Promise<{ token: string }> {
	return requestJson("/auth/login", "Erro ao entrar", { method: "POST", body: input, auth: false });
}

export async function me(): Promise<AuthUser> {
	return requestJson("/auth/me", "Erro ao validar sessão");
}

export async function fetchAvaliadores(): Promise<Avaliador[]> {
	return requestJson("/avaliadores", "Erro ao buscar avaliadores");
}

export async function createAvaliador(input: CreateAvaliadorInput): Promise<Avaliador> {
	return requestJson("/avaliadores", "Erro ao criar avaliador", { method: "POST", body: input });
}

export async function updateAvaliador(
	id: number,
	input: Partial<CreateAvaliadorInput>,
): Promise<Avaliador> {
	return requestJson(`/avaliadores/${id}`, "Erro ao atualizar avaliador", {
		method: "PUT",
		body: input,
	});
}

export async function deleteAvaliador(id: number): Promise<void> {
	await request(`/avaliadores/${id}`, "Erro ao deletar avaliador", { method: "DELETE" });
}

export type AmostraIaResult = CreateAmostraInput & { camposNaoEncontrados: string[] };

export async function gerarAmostraIa(pdf: File): Promise<AmostraIaResult> {
	const form = new FormData();
	form.append("pdf", pdf);
	return requestJson("/amostras/ia", "Geração da amostra", { method: "POST", body: form });
}

export async function downloadExcelRae(amostraId: number): Promise<DownloadFile> {
	return requestFile(
		`/amostras/${amostraId}/rae`,
		"Etapa 3 - Download do Excel",
		`dados-rae-${amostraId}.xlsx`,
	);
}

export async function downloadAmostrasPlanilha(
	filters: AmostrasFilters = {},
): Promise<DownloadFile> {
	return requestFile(
		withQuery("/amostras/planilha", amostrasFilterParams(filters)),
		"Erro ao exportar planilha",
		"amostras.xlsx",
	);
}

export async function fetchAmostras(
	filters: AmostrasFilters = {},
	page: { cursor?: number; limit?: number } = {},
): Promise<AmostrasPage> {
	const query = amostrasFilterParams(filters);
	if (page.cursor != null) query.set("cursor", String(page.cursor));
	if (page.limit != null) query.set("limit", String(page.limit));
	return requestJson(withQuery("/amostras", query), "Erro ao carregar as amostras");
}

export type AmostrasStats = {
	total: number;
	min: number | null;
	max: number | null;
	mean: number | null;
	median: number | null;
	q1: number | null;
	q3: number | null;
	iqr: number | null;
	stdDev: number | null;
	lowerFence: number | null;
	upperFence: number | null;
	outlierIds: number[];
};

const statsNumberKeys = [
	"min",
	"max",
	"mean",
	"median",
	"q1",
	"q3",
	"iqr",
	"stdDev",
	"lowerFence",
	"upperFence",
] as const;

// Os números chegam como string ou number, conforme o schema da rota; normaliza tudo aqui.
export async function fetchAmostrasStats(filters: AmostrasFilters = {}): Promise<AmostrasStats> {
	const stats = await requestJson<Record<string, unknown>>(
		withQuery("/amostras/stats", amostrasFilterParams(filters)),
		"Erro ao carregar estatísticas",
	);
	const numbers = Object.fromEntries(
		statsNumberKeys.map((key) => [key, stats[key] == null ? null : Number(stats[key])]),
	) as Pick<AmostrasStats, (typeof statsNumberKeys)[number]>;
	return {
		...numbers,
		total: Number(stats.total),
		outlierIds: ((stats.outlierIds as unknown[]) ?? []).map(Number),
	};
}

export type Municipio = {
	id: number;
	nome: string;
	uf: string | null;
	totalAmostras: number;
};

// id e totalAmostras chegam como string ou number, conforme o schema da rota
export async function fetchMunicipios(): Promise<Municipio[]> {
	const municipios = await requestJson<Municipio[]>("/municipios", "Erro ao carregar municípios");
	return municipios.map((municipio) => ({
		...municipio,
		id: Number(municipio.id),
		totalAmostras: Number(municipio.totalAmostras),
	}));
}

export async function createAmostra(amostra: CreateAmostraInput): Promise<Amostra> {
	return requestJson("/amostras", "Erro ao criar a amostra", { method: "POST", body: amostra });
}

export async function fetchAmostra(id: number): Promise<Amostra> {
	return requestJson(`/amostras/${id}`, "Erro ao carregar amostra");
}

export async function updateAmostra(id: number, amostra: CreateAmostraInput): Promise<Amostra> {
	return requestJson(`/amostras/${id}`, "Erro ao atualizar amostra", {
		method: "PUT",
		body: amostra,
	});
}

export async function deleteAmostra(id: number): Promise<void> {
	await request(`/amostras/${id}`, "Erro ao deletar amostra", { method: "DELETE" });
}
