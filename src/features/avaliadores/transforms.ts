import type { Avaliador, CreateAvaliadorInput } from "@/lib/api";
import type { AvaliadorFormValues } from "./schema";

export function avaliadorToFormValues(avaliador: Avaliador): AvaliadorFormValues {
	return {
		nome: avaliador.nome,
		nomeFantasia: avaliador.nomeFantasia,
		cpf: avaliador.cpf,
		cnpj: avaliador.cnpj,
		registroCrea: avaliador.registroCrea,
	};
}

export function parseAvaliadorFormValues(values: AvaliadorFormValues): CreateAvaliadorInput {
	return {
		nome: values.nome.trim(),
		nomeFantasia: values.nomeFantasia.trim(),
		cpf: values.cpf.trim(),
		cnpj: values.cnpj.trim(),
		registroCrea: values.registroCrea.trim(),
	};
}
