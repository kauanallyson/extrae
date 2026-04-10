import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

const CONFIG = {
  model: "gemini-2.5-flash",
  temperature: 0.1,
  timeoutMs: 30_000,
  maxRetries: 3,
  retryBaseDelayMs: 2_000,
} as const;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    proponente: { type: "string" },
    cpf_cnpj: { type: "string" },
    ddd: { type: "string" },
    telefone: { type: "string" },
    endereco_literal: { type: "string" },
    bairro: { type: "string" },
    cep: { type: "string" },
    municipio: { type: "string" },
    uf: { type: "string" },
    coordenada_s: { type: "string" },
    coordenada_w: { type: "string" },
    valor_terreno: { type: "number" },
    valor_imovel: { type: "number" },
    valor_unitario: { type: "number" },
    testada: { type: "number" },
    matricula: { type: "string" },
    oficio: { type: "string" },
    comarca: { type: "string" },
    uf_matricula: { type: "string" },
    incidencias: { type: "array", items: { type: "number" } },
    numero_etapas: { type: "number" },
    acumulado_proposto: { type: "array", items: { type: "number" } },
    idade_estimada: { type: "string" },
    area_terreno: { type: "number" },
    area_construida: { type: "number" },
    quartos: { type: "number" },
    banheiros: { type: "number" },
    suites: { type: "number" },
    vagas: { type: "number" },
    padrao_acabamento: { type: "string" },
    estado_conservacao: { type: "string" },
    infraestrutura: { type: "string" },
    servicos_publicos: { type: "string" },
    usos_predominantes: { type: "string" },
    via_acesso: { type: "string" },
    regiao_contexto: { type: "string" },
    data_referencia: { type: "string" },
    empresa_responsavel: { type: "string" },
  },
  required: [
    "proponente",
    "ddd",
    "telefone",
    "endereco_literal",
    "incidencias",
    "empresa_responsavel",
  ],
} as const;

export interface LaudoExtraido {
  proponente: string;
  ddd: string;
  telefone: string;
  endereco_literal: string;
  incidencias: number[];
  empresa_responsavel: string;
  cpf_cnpj?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  coordenada_s?: string;
  coordenada_w?: string;
  complemento?: string;
  valor_terreno?: number;
  valor_imovel?: number;
  valor_unitario?: number;
  testada?: number;
  matricula?: string;
  oficio?: string;
  comarca?: string;
  uf_matricula?: string;
  numero_etapas?: number;
  acumulado_proposto?: number[];
  idade_estimada?: string;
  area_terreno?: number;
  area_construida?: number;
  quartos?: number;
  banheiros?: number;
  suites?: number;
  vagas?: number;
  padrao_acabamento?: string;
  estado_conservacao?: string;
  infraestrutura?: string;
  servicos_publicos?: string;
  usos_predominantes?: string;
  via_acesso?: string;
  regiao_contexto?: string;
  data_referencia?: string;
}

const SYSTEM_PROMPT = `
Você é um ENGENHEIRO REVISOR ESPECIALISTA EM LAUDOS DE AVALIAÇÃO DA CAIXA ECONÔMICA FEDERAL.
Sua tarefa é extrair informações técnicas do laudo abaixo e retornar EXCLUSIVAMENTE um JSON válido, rigorosamente conforme o schema fornecido.
NÃO explique nada fora do JSON.

═══════════════════════════════════════
 1. COORDENADAS GEOGRÁFICAS
═══════════════════════════════════════

O texto abaixo não é Markdown — ele é um RETRATO ESPACIAL do PDF.
As colunas estão alinhadas com espaços reproduzindo a posição exata da tabela original.
Olhe o visual do texto perto de "Latitude" e "Longitude Oeste".

REGRA DE CLASSIFICAÇÃO (Brasil):
  1. Mapeie visualmente as colunas [Graus], [Min] e [Seg].
  2. Extraia o 1º conjunto na mesma linha horizontal → depois o 2º conjunto.
  3. Classifique pelo GRAU:
     • 00º-33º → LATITUDE  (coordenada_s)
     • 34º-74º → LONGITUDE (coordenada_w)

Formato exigido:
  coordenada_s: "XXºYY'ZZ,ZZZ"
  coordenada_w: "XXºYY'ZZ,ZZZ"

═══════════════════════════════════════
 2. CRONOGRAMA
═══════════════════════════════════════

2a) acumulado_proposto
  - Localize a tabela "Cronograma" ou "Parcelas".
  - O 1º valor DEVE ser o da linha "Pré-executado" (mesmo que 0.00).
  - Em seguida, extraia "% Acumulado" para as parcelas 1, 2, 3…
  - Total de etapas = "Número de Parcelas Previstas".

2b) Incidências (pesos)
  - Localize: "Cronograma Físico-Financeiro", "Discriminação dos Serviços" ou "Orçamento Proposto".
  - Extraia a coluna INCIDÊNCIA — retorne EXATAMENTE 20 valores percentuais.
  - Preserve a ordem original. NÃO normalize, NÃO ajuste, NÃO redistribua.
  - Se < 20 etapas, complete com 0.0 até 20 itens.

═══════════════════════════════════════
 3. CAMPOS CLASSIFICÁVEIS
═══════════════════════════════════════

VIA_ACESSO
  Retorne SOMENTE se explícito no laudo. Valores: LOCAL | COLETORA | ARTERIAL.
  Caso contrário → string vazia.

PADRAO_ACABAMENTO / ESTADO_CONSERVACAO / REGIAO_CONTEXTO
  NÃO infira. NÃO classifique por suposição.
  Se não estiver textual e claramente descrito → string vazia.

═══════════════════════════════════════
 4. OUTRAS REGRAS CRÍTICAS
═══════════════════════════════════════

ENDERECO_LITERAL
  Copie EXATAMENTE como consta na identificação do imóvel (abreviações, números, ordem).

MATRÍCULA
  Extraia: número da matrícula, OFÍCIO (nº do cartório), COMARCA (município), UF_MATRICULA (estado).

IDADE_ESTIMADA
  Capture o TEXTO LITERAL COMPLETO. Ex: "5 anos", "Novo", "Na Planta".

DATA_REFERENCIA
  Use EXCLUSIVAMENTE a data da AVALIAÇÃO DO IMÓVEL (formato DD/MM/AAAA).
  Ignore datas de ART, vistoria, assinatura ou emissão.

EMPRESA_RESPONSAVEL
  Seção "SIGNATÁRIOS" → campo "Representante legal" do Responsável Técnico → nome literal completo.

CAMPOS AUSENTES
  Texto → ""  |  Número → 0  |  Lista → []

═══════════════════════════════════════
 ⚠ ERROS GRAVES
═══════════════════════════════════════

- Misturar dados entre campos invalida a extração.
- Inferir informações técnicas não explícitas é PROIBIDO.
`;

function buildPrompt(laudoText: string): string {
  return `${SYSTEM_PROMPT}
═══════════════════════════════════════
 TEXTO DO LAUDO
═══════════════════════════════════════
${laudoText}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout após ${ms}ms: ${label}`)), ms),
  );
  return Promise.race([promise, timeout]);
}

function parseResponse(response: GenerateContentResponse): LaudoExtraido {
  const text = response.text;
  if (!text) throw new Error("Gemini retornou resposta vazia.");
  return JSON.parse(text) as LaudoExtraido;
}

export async function extractLaudoData(
  apiKey: string,
  laudoText: string,
  options: { retries?: number } = {},
): Promise<LaudoExtraido> {
  const { retries = CONFIG.maxRetries } = options;
  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`extractLaudoData: attempt ${attempt}/${retries}`);

      const response = await withTimeout(
        ai.models.generateContent({
          model: CONFIG.model,
          contents: buildPrompt(laudoText),
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            temperature: CONFIG.temperature,
          },
        }),
        CONFIG.timeoutMs,
        "generateContent",
      );

      return parseResponse(response);
    } catch (error) {
      console.error(`extractLaudoData: attempt ${attempt} failed`, error);
      if (attempt === retries) throw error;
      await sleep(attempt * CONFIG.retryBaseDelayMs);
    }
  }

  throw new Error("Falha após todas as tentativas.");
}
