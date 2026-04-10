import writeExcelFile from "write-excel-file/browser";
import type { Row, SheetData } from "write-excel-file/browser";
import type { GeminiResponse } from "./useGemini";

function toF(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Constrói o mapa de dados base (coluna A = rótulo, coluna B = valor).
 */
function buildBaseMap(dados: GeminiResponse): [string, string | number][] {
  return [
    ["proponente", String(dados.proponente ?? "").toUpperCase()],
    ["cpf_cnpj", String(dados.cpf_cnpj ?? "")],
    ["ddd", String(dados.ddd ?? "")],
    ["telefone", String(dados.telefone ?? "")],
    ["endereco_literal", String(dados.endereco_literal ?? "").toUpperCase()],
    ["coordenada_s", String(dados.coordenada_s ?? "")],
    ["coordenada_w", String(dados.coordenada_w ?? "")],
    ["complemento", String(dados.complemento ?? "").toUpperCase()],
    ["bairro", String(dados.bairro ?? "").toUpperCase()],
    ["cep", String(dados.cep ?? "")],
    ["municipio", String(dados.municipio ?? "").toUpperCase()],
    ["uf", String(dados.uf ?? "")],
    ["valor_terreno", toF(dados.valor_terreno)],
    ["matricula", String(dados.matricula ?? "")],
    ["oficio", String(dados.oficio ?? "")],
    ["comarca", String(dados.comarca ?? "")],
    ["uf_matricula", String(dados.uf_matricula ?? "")],
    ["categoria", "Casa"],
    ["uso", "Residencial"],
    ["finalidade_vistoria", "Vistoria para aferição de obra"],
    ["valor_imovel", toF(dados.valor_imovel)],
    ["numero_etapas", toF(dados.numero_etapas)],
    ["empresa", ""],
    ["cnpj", ""],
    ["cpf_empresa", ""],
    ["nome_responsavel", ""],
    ["cpf_responsavel", ""],
    ["registro", ""],
  ];
}

/**
 *   Colunas A-B: dados básicos (28 linhas)
 *   Colunas C-F: incidências (20 linhas, C=rótulo, D-F=merge com valor)
 *   Colunas G-J: acumulado proposto (37 linhas, G=rótulo, H-J=merge com valor)
 */
function buildSheetData(dados: GeminiResponse): SheetData {
  const baseMap = buildBaseMap(dados);
  const incs = dados.incidencias ?? [];
  const ap = dados.acumulado_proposto ?? [];

  const totalRows = 37; // maior seção (acumulado_proposto)
  const rows: SheetData = [];

  let acumuladoStop = false;

  for (let i = 0; i < totalRows; i++) {
    const row: Row = [];

    // ── Colunas A-B: dados básicos (linhas 0..27) ──
    if (i < baseMap.length) {
      const [rotulo, valor] = baseMap[i];
      row.push({ value: rotulo, type: String });
      row.push({
        value: typeof valor === "number" ? valor : String(valor),
        type: typeof valor === "number" ? Number : String,
      });
    } else {
      row.push(null, null);
    }

    // ── Colunas C-F: incidências (linhas 0..19) ──
    if (i < 20) {
      row.push({ value: `incidencia_${i + 1}`, type: String });
      // Coluna D com span=3 para cobrir D-E-F (merge)
      const incVal = i < incs.length ? toF(incs[i]) : 0.0;
      row.push({ value: incVal, type: Number, span: 3 });
      row.push(null); // E (coberta pelo span)
      row.push(null); // F (coberta pelo span)
    } else {
      row.push(null, null, null, null);
    }

    // ── Colunas G-J: acumulado proposto (linhas 0..36) ──
    row.push({ value: `acumulado_${i}`, type: String });
    // Coluna H com span=3 para cobrir H-I-J (merge)
    if (!acumuladoStop && i < ap.length) {
      const v = toF(ap[i]);
      row.push({ value: v, type: Number, span: 3 });
      if (v >= 100) acumuladoStop = true;
    } else {
      row.push({ value: undefined, span: 3 });
    }
    row.push(null); // I (coberta pelo span)
    row.push(null); // J (coberta pelo span)

    rows.push(row);
  }

  return rows;
}

/**
 * Gera o nome base do proponente para o nome do arquivo.
 */
function buildFileName(dados: GeminiResponse): string {
  const proponente = String(dados.proponente ?? "").trim();
  const nomes = proponente.split(/\s+/);
  let nome: string;
  if (nomes.length >= 2) {
    nome = `${nomes[0]}_${nomes[nomes.length - 1]}`.toUpperCase();
  } else if (nomes.length === 1 && nomes[0]) {
    nome = nomes[0].toUpperCase();
  } else {
    nome = "LAUDO";
  }
  return `DADOS_IA_${nome}.xlsx`;
}

export async function generateWorkbook(dados: GeminiResponse): Promise<void> {
  const sheetData = buildSheetData(dados);
  const fileName = buildFileName(dados);

  await writeExcelFile([sheetData], {
    sheets: ["DADOS_IA"],
    fileName,
  });
}
