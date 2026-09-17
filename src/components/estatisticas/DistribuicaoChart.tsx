import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatBrl } from "@/lib/format";
import { Caixa } from "./Caixa";
import { distribuicaoLinhas, type Serie } from "./distribuicao";

const chartConfig = {
	caixa: { label: "Q1 a Q3" },
} satisfies ChartConfig;

export function DistribuicaoChart({ series }: { series: Serie[] }) {
	const { linhas, dominio } = distribuicaoLinhas(series);

	if (linhas.length === 0) return null;

	return (
		<TooltipProvider>
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
						domain={dominio}
						tickCount={5}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: number) => formatBrl(value)}
					/>
					<YAxis type="category" dataKey="nome" width={120} tickLine={false} axisLine={false} />
					<Bar dataKey="caixa" barSize={40} shape={<Caixa />} isAnimationActive={false} />
				</BarChart>
			</ChartContainer>
		</TooltipProvider>
	);
}
