const BASE_URL = "/api";

export type Avaliador = {
	id: number;
	nome: string;
	nomeFantasia: string;
	cpf: string;
	cnpj: string;
	registroCrea: string;
};

export async function fetchAvaliadores(): Promise<Avaliador[]> {
	const res = await fetch(`${BASE_URL}/avaliadores`);
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao buscar avaliadores: ${msg}`);
	}
	return res.json();
}

export async function extrairTextoPdf(pdf: File): Promise<string> {
	const form = new FormData();
	form.append("pdf", pdf);

	const res = await fetch(`${BASE_URL}/pdf`, {
		method: "POST",
		body: form,
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Extração de texto: ${msg}`);
	}

	return res.text();
}

export async function gerarAmostraIa(
	avaliadorId: number,
	amostraText: string,
): Promise<number> {
	const res = await fetch(`${BASE_URL}/amostras/ia`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ avaliadorId, amostraText }),
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Etapa 2 - Geração da amostra: ${msg}`);
	}

	const data = await res.json();
	return data.amostraId as number;
}

export type DownloadResult = { blobUrl: string; filename: string };

export async function downloadExcelRae(
	amostraId: number,
): Promise<DownloadResult> {
	const res = await fetch(`${BASE_URL}/amostras/${amostraId}/rae`);

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Etapa 3 - Download do Excel: ${msg}`);
	}

	const disposition = res.headers.get("Content-Disposition");
	const filename =
		disposition?.split("filename=")[1]?.replace(/"/g, "") ||
		`dados-rae-${amostraId}.xlsx`;

	const blob = await res.blob();
	return { blobUrl: URL.createObjectURL(blob), filename };
}
