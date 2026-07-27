import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { AmostrasStats } from "@/lib/api";
import { formatBrl } from "@/lib/format";

type ComparativoChartProps = {
	municipio: string;
	stats: AmostrasStats;
	geral: AmostrasStats;
};

export function ComparativoChart({ municipio, stats, geral }: ComparativoChartProps) {
	const chartConfig = {
		municipio: { label: municipio, color: "var(--chart-1)" },
		geral: { label: "Ceará (geral)", color: "var(--chart-2)" },
	} satisfies ChartConfig;

	const data = [
		{ metrica: "Média", municipio: stats.mean, geral: geral.mean },
		{ metrica: "Mediana", municipio: stats.median, geral: geral.median },
		{ metrica: "Q1", municipio: stats.q1, geral: geral.q1 },
		{ metrica: "Q3", municipio: stats.q3, geral: geral.q3 },
	].filter((linha) => linha.municipio != null || linha.geral != null);

	if (data.length === 0) return null;

	return (
		<ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
			<BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="metrica" tickLine={false} axisLine={false} tickMargin={8} />
				<YAxis
					tickLine={false}
					axisLine={false}
					width={80}
					tickFormatter={(value: number) => formatBrl(value)}
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent formatter={(value) => formatBrl(Number(value))} indicator="dot" />
					}
				/>
				<ChartLegend content={<ChartLegendContent />} />
				<Bar dataKey="municipio" fill="var(--color-municipio)" radius={[4, 4, 0, 0]} />
				<Bar dataKey="geral" fill="var(--color-geral)" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ChartContainer>
	);
}
