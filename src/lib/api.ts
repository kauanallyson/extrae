import { clearToken, getToken } from "@/lib/auth";

const BASE_URL =
	import.meta.env.VITE_API_BASE_URL ??
	(import.meta.env.PROD ? "https://extrae.duckdns.org" : "/api");

function authHeaders(): HeadersInit {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(res: Response): void {
	if (res.status !== 401) return;
	clearToken();
	window.location.href = "/login";
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

export type DownloadResult = { blobUrl: string; filename: string };

export type AmostrasPage = {
	data: Amostra[];
	nextCursor: number | null;
};

export type AmostrasFilters = {
	from?: string;
	to?: string;
	municipio?: string;
	uf?: string;
	valorImovelMin?: string;
	valorImovelMax?: string;
	valorTerrenoMin?: string;
	valorTerrenoMax?: string;
};

async function readErrorMessage(res: Response): Promise<string> {
	try {
		const body = await res.json();
		return body?.message ?? res.statusText;
	} catch {
		return (await res.text().catch(() => res.statusText)) || res.statusText;
	}
}

async function assertOk(res: Response, errorPrefix: string): Promise<void> {
	if (res.ok) return;
	handleUnauthorized(res);
	throw new Error(`${errorPrefix}: ${await readErrorMessage(res)}`);
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

async function toDownloadResult(res: Response, fallbackFilename: string): Promise<DownloadResult> {
	const filename = contentDispositionFilename(res, fallbackFilename);
	const blob = await res.blob();
	return { blobUrl: URL.createObjectURL(blob), filename };
}

const upperFilterKeys = new Set<keyof AmostrasFilters>(["municipio", "uf"]);

function amostrasFilterParams(filters: AmostrasFilters): URLSearchParams {
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
	const res = await fetch(`${BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	await assertOk(res, "Erro ao entrar");
	return res.json();
}

export async function me(): Promise<AuthUser> {
	const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
	await assertOk(res, "Erro ao validar sessão");
	return res.json();
}

export async function fetchAvaliadores(): Promise<Avaliador[]> {
	const res = await fetch(`${BASE_URL}/avaliadores`, { headers: authHeaders() });
	await assertOk(res, "Erro ao buscar avaliadores");
	return res.json();
}

export async function createAvaliador(input: CreateAvaliadorInput): Promise<Avaliador> {
	const res = await fetch(`${BASE_URL}/avaliadores`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify(input),
	});
	await assertOk(res, "Erro ao criar avaliador");
	return res.json();
}

export async function updateAvaliador(
	id: number,
	input: Partial<CreateAvaliadorInput>,
): Promise<Avaliador> {
	const res = await fetch(`${BASE_URL}/avaliadores/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify(input),
	});
	await assertOk(res, "Erro ao atualizar avaliador");
	return res.json();
}

export async function deleteAvaliador(id: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/avaliadores/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});
	await assertOk(res, "Erro ao deletar avaliador");
}

export type AmostraIaResult = CreateAmostraInput & { camposNaoEncontrados: string[] };

export async function gerarAmostraIa(pdf: File): Promise<AmostraIaResult> {
	const form = new FormData();
	form.append("pdf", pdf);

	const res = await fetch(`${BASE_URL}/amostras/ia`, {
		method: "POST",
		headers: authHeaders(),
		body: form,
	});
	await assertOk(res, "Geração da amostra");
	return res.json() as Promise<AmostraIaResult>;
}

export async function downloadExcelRae(amostraId: number): Promise<DownloadResult> {
	const res = await fetch(`${BASE_URL}/amostras/${amostraId}/rae`, { headers: authHeaders() });
	await assertOk(res, "Etapa 3 - Download do Excel");
	return toDownloadResult(res, `dados-rae-${amostraId}.xlsx`);
}

export async function downloadAmostrasPlanilha(
	filters: AmostrasFilters = {},
): Promise<DownloadResult> {
	const query = amostrasFilterParams(filters).toString();
	const res = await fetch(`${BASE_URL}/amostras/planilha${query ? `?${query}` : ""}`, {
		headers: authHeaders(),
	});

	if (!res.ok) {
		handleUnauthorized(res);
		throw new Error(await readErrorMessage(res));
	}
	return toDownloadResult(res, "amostras.xlsx");
}

export type AmostraTipo = "imovel" | "terreno";

export async function fetchAmostras(
	params: { cursor?: number; limit?: number; tipo?: AmostraTipo } = {},
): Promise<AmostrasPage> {
	const query = new URLSearchParams();
	if (params.cursor != null) query.set("cursor", String(params.cursor));
	if (params.limit != null) query.set("limit", String(params.limit));
	if (params.tipo != null) query.set("tipo", params.tipo);
	const qs = query.toString();

	const res = await fetch(`${BASE_URL}/amostras${qs ? `?${qs}` : ""}`, { headers: authHeaders() });
	if (!res.ok) {
		handleUnauthorized(res);
		throw new Error(`Erro ao carregar as amostras: ${await readErrorMessage(res)}`);
	}
	return res.json();
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

// total e outlierIds chegam como string ou number, conforme o schema da rota
export async function fetchAmostrasStats(municipio?: string): Promise<AmostrasStats> {
	const query = new URLSearchParams();
	const trimmed = municipio?.trim();
	if (trimmed) query.set("municipio", trimmed.toUpperCase());
	const qs = query.toString();

	const res = await fetch(`${BASE_URL}/amostras/stats${qs ? `?${qs}` : ""}`, {
		headers: authHeaders(),
	});
	await assertOk(res, "Erro ao carregar estatísticas");

	const stats = await res.json();
	return {
		...stats,
		total: Number(stats.total),
		outlierIds: (stats.outlierIds ?? []).map(Number),
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
	const res = await fetch(`${BASE_URL}/municipios/`, { headers: authHeaders() });
	await assertOk(res, "Erro ao carregar municípios");

	const municipios = await res.json();
	return municipios.map((municipio: Municipio) => ({
		...municipio,
		id: Number(municipio.id),
		totalAmostras: Number(municipio.totalAmostras),
	}));
}

export async function createAmostra(amostra: CreateAmostraInput): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify(amostra),
	});
	await assertOk(res, "Erro ao criar a amostra");
	return res.json();
}

export async function fetchAmostra(id: number): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`, { headers: authHeaders() });
	await assertOk(res, "Erro ao carregar amostra");
	return res.json();
}

export async function updateAmostra(id: number, amostra: CreateAmostraInput): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify(amostra),
	});
	await assertOk(res, "Erro ao atualizar amostra");
	return res.json();
}

export async function deleteAmostra(id: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});
	await assertOk(res, "Erro ao deletar amostra");
}
