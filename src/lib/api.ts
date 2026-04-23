const BASE_URL = "/api";

export type Profissional = {
	id: number;
	nome: string;
	nomeFantasia: string;
	cpf: string;
	cnpj: string;
	registroCrea: string;
};

export async function fetchProfissionais(): Promise<Profissional[]> {
	const res = await fetch(`${BASE_URL}/profissionais`);
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Erro ao buscar profissionais: ${msg}`);
	}
	return res.json();
}

export async function extrairTextoPdf(pdf: File): Promise<string> {
	const form = new FormData();
	form.append("pdf", pdf);

	const res = await fetch(`${BASE_URL}/extrair-texto-pdf`, {
		method: "POST",
		body: form,
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Extração de texto: ${msg}`);
	}

	return res.text();
}

export async function gerarLaudoIa(
	profissionalId: number,
	laudoText: string,
): Promise<number> {
	const res = await fetch(`${BASE_URL}/gerar-laudo-ia`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ profissionalId, laudoText }),
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Etapa 2 - Geração do laudo: ${msg}`);
	}

	const data = await res.json();
	return data.laudoId as number;
}

export type DownloadResult = { blobUrl: string; filename: string };

export async function downloadExcelRae(
	laudoId: number,
): Promise<DownloadResult> {
	const res = await fetch(`${BASE_URL}/gerar-excel-rae/${laudoId}`);

	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`Etapa 3 - Download do Excel: ${msg}`);
	}

	const disposition = res.headers.get("Content-Disposition");
	const filename =
		disposition?.split("filename=")[1]?.replace(/"/g, "") ||
		`dados-rae-${laudoId}.xlsx`;

	const blob = await res.blob();
	return { blobUrl: URL.createObjectURL(blob), filename };
}
