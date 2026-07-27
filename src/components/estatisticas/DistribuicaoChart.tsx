import { Bar, BarChart, CartesianGrid, ErrorBar, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { AmostrasStats } from "@/lib/api";
import { formatBrl } from "@/lib/format";

const chartConfig = {
	caixa: { label: "Q1 a Q3" },
} satisfies ChartConfig;

const CORES = ["var(--chart-1)", "var(--chart-2)"];

type Serie = { nome: string; stats: AmostrasStats };

type Linha = {
	nome: string;
	caixa: [number, number];
	bigodes: [number, number];
	mediana: number;
	cor: string;
	stats: AmostrasStats;
};

// Cada série vira uma barra-faixa de Q1 a Q3; a mediana é o corte desenhado dentro
// da caixa e os bigodes são um ErrorBar assimétrico preso ao fim da barra (Q3),
// indo do menor ao maior valor observado.
export function DistribuicaoChart({ series }: { series: Serie[] }) {
	const linhas: Linha[] = [];
	for (const [indice, { nome, stats }] of series.entries()) {
		const { min, max, median, q1, q3 } = stats;
		if (min == null || max == null || median == null || q1 == null || q3 == null) continue;
		linhas.push({
			nome,
			caixa: [q1, q3],
			bigodes: [q3 - min, max - q3],
			mediana: median,
			cor: CORES[indice % CORES.length],
			stats,
		});
	}

	if (linhas.length === 0) return null;

	// O eixo cobre só a faixa dos dados — começar em zero espremeria as caixas num canto.
	const menor = Math.min(...linhas.map((linha) => linha.stats.min ?? 0));
	const maior = Math.max(...linhas.map((linha) => linha.stats.max ?? 0));
	const folga = (maior - menor || maior * 0.1 || 1) * 0.08;

	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-auto w-full"
			style={{ height: 72 + linhas.length * 64 }}
		>
			<BarChart
				accessibilityLayer
				data={linhas}
				layout="vertical"
				margin={{ top: 8, right: 16, bottom: 8 }}
			>
				<CartesianGrid horizontal={false} />
				<XAxis
					type="number"
					domain={[menor - folga, maior + folga]}
					tickCount={5}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value: number) => formatBrl(value)}
				/>
				<YAxis type="category" dataKey="nome" width={120} tickLine={false} axisLine={false} />
				<ChartTooltip
					cursor={false}
					content={({ payload }) => {
						const linha = payload?.[0]?.payload as Linha | undefined;
						return linha ? <ResumoTooltip nome={linha.nome} stats={linha.stats} /> : null;
					}}
				/>
				<Bar dataKey="caixa" barSize={40} shape={<Caixa />} isAnimationActive={false}>
					<ErrorBar
						dataKey="bigodes"
						direction="x"
						width={10}
						strokeWidth={2}
						stroke="var(--muted-foreground)"
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}

type CaixaProps = { x?: number; y?: number; width?: number; height?: number; payload?: Linha };

function Caixa({ x = 0, y = 0, width = 0, height = 0, payload }: CaixaProps) {
	if (!payload) return null;
	const [q1, q3] = payload.caixa;
	// A escala é linear, então a mediana cai proporcionalmente entre as bordas da caixa.
	const fracao = q3 > q1 ? (payload.mediana - q1) / (q3 - q1) : 0.5;
	const mediana = x + width * fracao;

	return (
		<g>
			<rect x={x} y={y} width={width} height={height} rx={4} fill={payload.cor} />
			<line x1={mediana} x2={mediana} y1={y} y2={y + height} stroke="var(--card)" strokeWidth={2} />
		</g>
	);
}

function ResumoTooltip({ nome, stats }: { nome: string; stats: AmostrasStats }) {
	const linhas: [string, number | null][] = [
		["Mínimo", stats.min],
		["Limite inferior", stats.lowerFence],
		["Q1", stats.q1],
		["Mediana", stats.median],
		["Q3", stats.q3],
		["Limite superior", stats.upperFence],
		["Máximo", stats.max],
	];

	return (
		<div className="grid gap-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs shadow-xl">
			<p className="mb-1 font-medium text-slate-100">{nome}</p>
			{linhas.map(([label, valor]) => (
				<div key={label} className="flex items-center justify-between gap-6">
					<span className="text-slate-400">{label}</span>
					<span className="tabular-nums text-slate-100">
						{valor != null ? formatBrl(valor) : "-"}
					</span>
				</div>
			))}
		</div>
	);
}
