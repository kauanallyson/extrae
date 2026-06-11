import type { CreateAmostraInput } from "@/lib/api";
import { type AmostraFormValues, type ArrayValue, incidenciaServicos } from "./fields";

function parsePositiveNumber(value: string) {
	return Number(value.trim().replace(",", ".") || 0);
}

function parseFixedNumberArray(values: ArrayValue[]) {
	return values.map((item) => {
		const parsed = Number(item.value.trim().replace(",", "."));
		return Number.isFinite(parsed) ? parsed : 0;
	});
}

function parseNumberArray(values: ArrayValue[]) {
	return values
		.map((item) => item.value.trim().replace(",", "."))
		.filter(Boolean)
		.map(Number)
		.filter((item) => Number.isFinite(item));
}

function formatTelefone(digits: string): string {
	const d = digits.replace(/\D/g, "");
	if (d.length === 9) return `${d.slice(0, 5)}-${d.slice(5)}`;
	if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
	return digits;
}

function toDecimalComma(value: number): string {
	return value.toFixed(2).replace(".", ",");
}

function numberToCommaString(value: number | null | undefined): string {
	return value != null ? String(value).replace(".", ",") : "";
}

function moneyToCommaString(value: number | null | undefined): string {
	return value != null ? value.toFixed(2).replace(".", ",") : "";
}

export function amostraToFormValues(amostra: CreateAmostraInput): AmostraFormValues {
	return {
		avaliadorId: amostra.avaliadorId ? String(amostra.avaliadorId) : "",
		ddd: amostra.ddd,
		telefone: formatTelefone(amostra.telefone),
		incidencias: incidenciaServicos.map((_, i) => ({
			value: amostra.incidencias[i] != null ? toDecimalComma(amostra.incidencias[i]) : "",
		})),
		acumuladoProposto:
			amostra.acumuladoProposto.length > 0
				? amostra.acumuladoProposto.map((v) => ({
						value: toDecimalComma(v),
					}))
				: [{ value: "" }],
		proponente: amostra.proponente,
		cpf: amostra.cpf,
		cnpj: amostra.cnpj,
		endereco: amostra.endereco,
		coordenadaS: amostra.coordenadaS,
		coordenadaW: amostra.coordenadaW,
		complemento: amostra.complemento,
		bairro: amostra.bairro,
		cep: amostra.cep,
		municipio: amostra.municipio,
		uf: amostra.uf,
		empresaResponsavel: amostra.empresaResponsavel,
		valorTerreno: moneyToCommaString(amostra.valorTerreno),
		matricula: amostra.matricula,
		oficio: amostra.oficio,
		comarca: amostra.comarca,
		ufMatricula: amostra.ufMatricula,
		valorImovel: moneyToCommaString(amostra.valorImovel),
		numeroEtapas: amostra.numeroEtapas != null ? String(amostra.numeroEtapas) : "",
		valorUnitario: moneyToCommaString(amostra.valorUnitario),
		testada: numberToCommaString(amostra.testada),
		idadeEstimada: amostra.idadeEstimada,
		areaTerreno: numberToCommaString(amostra.areaTerreno),
		areaConstruida: numberToCommaString(amostra.areaConstruida),
		quartos: amostra.quartos != null ? String(amostra.quartos) : "",
		banheiros: amostra.banheiros != null ? String(amostra.banheiros) : "",
		suites: amostra.suites != null ? String(amostra.suites) : "",
		vagas: amostra.vagas != null ? String(amostra.vagas) : "",
		padraoAcabamento: amostra.padraoAcabamento,
		estadoConservacao: amostra.estadoConservacao,
		infraestrutura: amostra.infraestrutura,
		servicosPublicos: amostra.servicosPublicos,
		usosPredominantes: amostra.usosPredominantes,
		viaAcesso: amostra.viaAcesso,
		regiaoContexto: amostra.regiaoContexto,
		dataReferencia: amostra.dataReferencia,
	};
}

export function parseFormValues(values: AmostraFormValues): CreateAmostraInput {
	return {
		avaliadorId: Number(values.avaliadorId),
		proponente: values.proponente.trim(),
		cpf: values.cpf.trim(),
		cnpj: values.cnpj.trim(),
		ddd: values.ddd.replace(/\D/g, ""),
		telefone: values.telefone.replace(/\D/g, ""),
		endereco: values.endereco.trim(),
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
		incidencias: parseFixedNumberArray(values.incidencias),
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
