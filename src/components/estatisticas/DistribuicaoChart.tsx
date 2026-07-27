import { Bar, BarChart, CartesianGrid, ErrorBar, ReferenceLine, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { AmostrasStats } from "@/lib/api";
import { formatBrl } from "@/lib/format";

const chartConfig = {
	q1ToMedian: { label: "Q1 até mediana", color: "var(--chart-2)" },
	medianToQ3: { label: "Mediana até Q3", color: "var(--chart-1)" },
} satisfies ChartConfig;

// A caixa é montada com barras empilhadas: uma base transparente até Q1, depois
// Q1 -> mediana e mediana -> Q3. Os bigodes são um ErrorBar assimétrico preso ao
// fim da pilha (Q3), indo de lowerFence a upperFence.
type DistribuicaoChartProps = {
	stats: AmostrasStats;
	titulo: string;
};

export function DistribuicaoChart({ stats, titulo }: DistribuicaoChartProps) {
	const { min, max, median, q1, q3, lowerFence, upperFence } = stats;
	if (min == null || max == null || median == null || q1 == null || q3 == null) return null;

	const menor = lowerFence ?? min;
	const maior = upperFence ?? max;
	const limite = Math.max(max, maior) * 1.08;

	const data = [
		{
			faixa: titulo,
			base: q1,
			q1ToMedian: median - q1,
			medianToQ3: q3 - median,
			bigodes: [q3 - menor, maior - q3],
		},
	];

	return (
		<ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
			<BarChart accessibilityLayer data={data} layout="vertical" margin={{ top: 24, bottom: 8 }}>
				<CartesianGrid horizontal={false} />
				<XAxis
					type="number"
					domain={[0, limite]}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value: number) => formatBrl(value)}
				/>
				<YAxis type="category" dataKey="faixa" hide />
				<ChartTooltip cursor={false} content={() => <ResumoTooltip stats={stats} />} />
				<ReferenceLine
					x={min}
					stroke="var(--muted-foreground)"
					strokeDasharray="4 4"
					label={{ value: `Mín ${formatBrl(min)}`, position: "top", fill: "var(--foreground)" }}
				/>
				<ReferenceLine
					x={max}
					stroke="var(--muted-foreground)"
					strokeDasharray="4 4"
					label={{ value: `Máx ${formatBrl(max)}`, position: "top", fill: "var(--foreground)" }}
				/>
				<Bar dataKey="base" stackId="caixa" fill="transparent" isAnimationActive={false} />
				<Bar
					dataKey="q1ToMedian"
					stackId="caixa"
					fill="var(--color-q1ToMedian)"
					stroke="var(--card)"
					strokeWidth={2}
					barSize={56}
				/>
				<Bar
					dataKey="medianToQ3"
					stackId="caixa"
					fill="var(--color-medianToQ3)"
					stroke="var(--card)"
					strokeWidth={2}
					barSize={56}
					radius={[0, 4, 4, 0]}
				>
					<ErrorBar
						dataKey="bigodes"
						direction="x"
						width={10}
						strokeWidth={2}
						stroke="var(--chart-2)"
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}

function ResumoTooltip({ stats }: { stats: AmostrasStats }) {
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
