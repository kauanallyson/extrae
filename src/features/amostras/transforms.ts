import type { CreateAmostraInput } from "@/lib/api";
import { maskCep, maskDecimal, maskTelefone, unmaskDecimal } from "@/lib/validators";
import { type AmostraFormValues, type ArrayValue, incidenciaServicos } from "./fields";

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

function str(value: string | null | undefined): string {
	return value ?? "";
}

function nullableText(value: string): string | null {
	return value.trim() || null;
}

function nullableDigits(value: string): string | null {
	return value.replace(/\D/g, "") || null;
}

function nullableNumber(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = Number(unmaskDecimal(trimmed));
	return Number.isFinite(parsed) ? parsed : null;
}

function nullableArray<T>(values: T[]): T[] | null {
	return values.length > 0 ? values : null;
}

function formatTelefone(digits: string | null | undefined): string {
	return maskTelefone(str(digits));
}

function maskedArrayValue(value: number | null | undefined): string {
	return value != null ? maskDecimal(value.toFixed(2)) : "";
}

export function amostraToFormValues(amostra: CreateAmostraInput): AmostraFormValues {
	const incidencias = amostra.incidencias ?? [];
	const acumuladoProposto = amostra.acumuladoProposto ?? [];
	return {
		avaliadorId: amostra.avaliadorId ? String(amostra.avaliadorId) : "",
		ddd: str(amostra.ddd),
		telefone: formatTelefone(amostra.telefone),
		incidencias: incidenciaServicos.map((_, i) => ({
			value: maskedArrayValue(incidencias[i]),
		})),
		acumuladoProposto:
			acumuladoProposto.length > 0
				? acumuladoProposto.map((v) => ({
						value: maskedArrayValue(v),
					}))
				: [{ value: "" }],
		proponente: str(amostra.proponente),
		cpf: str(amostra.cpf),
		cnpj: str(amostra.cnpj),
		endereco: str(amostra.endereco),
		coordenadaS: str(amostra.coordenadaS),
		coordenadaW: str(amostra.coordenadaW),
		complemento: str(amostra.complemento),
		bairro: str(amostra.bairro),
		cep: maskCep(str(amostra.cep)),
		municipio: str(amostra.municipio),
		uf: str(amostra.uf),
		empresaResponsavel: str(amostra.empresaResponsavel),
		valorTerreno: maskedArrayValue(amostra.valorTerreno),
		matricula: str(amostra.matricula),
		oficio: str(amostra.oficio),
		comarca: str(amostra.comarca),
		ufMatricula: str(amostra.ufMatricula),
		valorImovel: maskedArrayValue(amostra.valorImovel),
		numeroEtapas: amostra.numeroEtapas != null ? String(amostra.numeroEtapas) : "",
		valorUnitario: maskedArrayValue(amostra.valorUnitario),
		testada: maskedArrayValue(amostra.testada),
		idadeEstimada: str(amostra.idadeEstimada),
		areaTerreno: maskedArrayValue(amostra.areaTerreno),
		areaConstruida: maskedArrayValue(amostra.areaConstruida),
		quartos: amostra.quartos != null ? String(amostra.quartos) : "",
		banheiros: amostra.banheiros != null ? String(amostra.banheiros) : "",
		suites: amostra.suites != null ? String(amostra.suites) : "",
		vagas: amostra.vagas != null ? String(amostra.vagas) : "",
		padraoAcabamento: str(amostra.padraoAcabamento),
		estadoConservacao: str(amostra.estadoConservacao),
		infraestrutura: str(amostra.infraestrutura),
		servicosPublicos: str(amostra.servicosPublicos),
		usosPredominantes: str(amostra.usosPredominantes),
		viaAcesso: str(amostra.viaAcesso),
		regiaoContexto: str(amostra.regiaoContexto),
		equacaoSISDEA: str(amostra.equacaoSISDEA),
		dataReferencia: str(amostra.dataReferencia),
	};
}

export function parseFormValues(values: AmostraFormValues): CreateAmostraInput {
	return {
		avaliadorId: Number(values.avaliadorId),
		proponente: nullableText(values.proponente),
		cpf: nullableText(values.cpf),
		cnpj: nullableText(values.cnpj),
		ddd: nullableDigits(values.ddd),
		telefone: nullableDigits(values.telefone),
		endereco: nullableText(values.endereco),
		coordenadaS: nullableText(values.coordenadaS),
		coordenadaW: nullableText(values.coordenadaW),
		complemento: nullableText(values.complemento),
		bairro: nullableText(values.bairro),
		cep: nullableText(values.cep),
		municipio: nullableText(values.municipio),
		uf: nullableText(values.uf),
		empresaResponsavel: nullableText(values.empresaResponsavel),
		valorTerreno: nullableNumber(values.valorTerreno),
		matricula: nullableText(values.matricula),
		oficio: nullableText(values.oficio),
		comarca: nullableText(values.comarca),
		ufMatricula: nullableText(values.ufMatricula),
		valorImovel: nullableNumber(values.valorImovel),
		incidencias: nullableArray(parseFixedNumberArray(values.incidencias)),
		numeroEtapas: nullableNumber(values.numeroEtapas),
		acumuladoProposto: nullableArray(parseNumberArray(values.acumuladoProposto)),
		valorUnitario: nullableNumber(values.valorUnitario),
		testada: nullableNumber(values.testada),
		idadeEstimada: nullableText(values.idadeEstimada),
		areaTerreno: nullableNumber(values.areaTerreno),
		areaConstruida: nullableNumber(values.areaConstruida),
		quartos: nullableNumber(values.quartos),
		banheiros: nullableNumber(values.banheiros),
		suites: nullableNumber(values.suites),
		vagas: nullableNumber(values.vagas),
		padraoAcabamento: nullableText(values.padraoAcabamento),
		estadoConservacao: nullableText(values.estadoConservacao),
		infraestrutura: nullableText(values.infraestrutura),
		servicosPublicos: nullableText(values.servicosPublicos),
		usosPredominantes: nullableText(values.usosPredominantes),
		viaAcesso: nullableText(values.viaAcesso),
		regiaoContexto: nullableText(values.regiaoContexto),
		equacaoSISDEA: nullableText(values.equacaoSISDEA),
		dataReferencia: nullableText(values.dataReferencia),
	};
}
