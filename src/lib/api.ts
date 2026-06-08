const BASE_URL =
	import.meta.env.VITE_API_BASE_URL ??
	(import.meta.env.PROD ? "https://extrae.duckdns.org" : "/api");

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
	proponente: string;
	cpf: string;
	cnpj: string;
	ddd: string;
	telefone: string;
	endereco: string;
	coordenadaS: string;
	coordenadaW: string;
	complemento: string;
	bairro: string;
	cep: string;
	municipio: string;
	uf: string;
	empresaResponsavel: string;
	valorTerreno: number;
	matricula: string;
	oficio: string;
	comarca: string;
	ufMatricula: string;
	valorImovel: number;
	incidencias: number[];
	numeroEtapas: number;
	acumuladoProposto: number[];
	valorUnitario: number;
	testada: number;
	idadeEstimada: string;
	areaTerreno: number;
	areaConstruida: number;
	quartos: number;
	banheiros: number;
	suites: number;
	vagas: number;
	padraoAcabamento: string;
	estadoConservacao: string;
	infraestrutura: string;
	servicosPublicos: string;
	usosPredominantes: string;
	viaAcesso: string;
	regiaoContexto: string;
	dataReferencia: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateAmostraInput = Omit<Amostra, "id" | "createdAt" | "updatedAt">;

export type CreateAvaliadorInput = Omit<Avaliador, "id">;

export async function fetchAvaliadores(): Promise<Avaliador[]> {
	const res = await fetch(`${BASE_URL}/avaliadores`);
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao buscar avaliadores: ${msg}`);
	}
	return res.json();
}

export async function createAvaliador(input: CreateAvaliadorInput): Promise<Avaliador> {
	const res = await fetch(`${BASE_URL}/avaliadores`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao criar avaliador: ${msg}`);
	}
	return res.json();
}

export async function updateAvaliador(
	id: number,
	input: Partial<CreateAvaliadorInput>,
): Promise<Avaliador> {
	const res = await fetch(`${BASE_URL}/avaliadores/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao atualizar avaliador: ${msg}`);
	}
	return res.json();
}

export async function deleteAvaliador(id: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/avaliadores/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao deletar avaliador: ${msg}`);
	}
}

export async function gerarAmostraIa(pdf: File): Promise<CreateAmostraInput> {
	const form = new FormData();
	form.append("pdf", pdf);

	const res = await fetch(`${BASE_URL}/amostras/ia`, {
		method: "POST",
		body: form,
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Geração da amostra: ${msg}`);
	}

	return res.json() as Promise<CreateAmostraInput>;
}

export type DownloadResult = { blobUrl: string; filename: string };

export async function downloadExcelRae(amostraId: number): Promise<DownloadResult> {
	const res = await fetch(`${BASE_URL}/amostras/${amostraId}/rae`);

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Etapa 3 - Download do Excel: ${msg}`);
	}

	const disposition = res.headers.get("Content-Disposition");
	const filename =
		disposition?.split("filename=")[1]?.replace(/"/g, "") || `dados-rae-${amostraId}.xlsx`;

	const blob = await res.blob();
	return { blobUrl: URL.createObjectURL(blob), filename };
}

// Shared by GET /amostras and GET /amostras/planilha (src/lib/amostras-filters.ts).
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

async function readErrorMessage(res: Response): Promise<string> {
	try {
		const body = await res.json();
		return body?.message ?? res.statusText;
	} catch {
		return (await res.text().catch(() => res.statusText)) || res.statusText;
	}
}

export async function downloadAmostrasPlanilha(
	filters: AmostrasFilters = {},
): Promise<DownloadResult> {
	const query = amostrasFilterParams(filters).toString();
	const res = await fetch(`${BASE_URL}/amostras/planilha${query ? `?${query}` : ""}`);

	if (!res.ok) {
		throw new Error(await readErrorMessage(res));
	}

	const disposition = res.headers.get("Content-Disposition");
	const filename = disposition?.split("filename=")[1]?.replace(/"/g, "") || "amostras.xlsx";

	const blob = await res.blob();
	return { blobUrl: URL.createObjectURL(blob), filename };
}

export async function fetchAmostras(filters: AmostrasFilters = {}): Promise<Amostra[]> {
	const query = amostrasFilterParams(filters).toString();
	const res = await fetch(`${BASE_URL}/amostras${query ? `?${query}` : ""}`);
	if (!res.ok) {
		throw new Error(`Erro ao carregar as amostras: ${await readErrorMessage(res)}`);
	}
	return res.json();
}

export async function createAmostra(amostra: CreateAmostraInput): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(amostra),
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao criar a amostra: ${msg}`);
	}

	return res.json();
}

export async function fetchAmostra(id: number): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`);
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao carregar amostra: ${msg}`);
	}
	return res.json();
}

export async function updateAmostra(id: number, amostra: CreateAmostraInput): Promise<Amostra> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(amostra),
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao atualizar amostra: ${msg}`);
	}
	return res.json();
}

export async function deleteAmostra(id: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/amostras/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao deletar amostra: ${msg}`);
	}
}
