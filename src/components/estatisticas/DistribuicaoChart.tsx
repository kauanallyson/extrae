import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBrl } from "@/lib/format";
import { distribuicaoLinhas, type Linha, type Serie } from "./distribuicao";

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

type CaixaProps = { x?: number; y?: number; width?: number; height?: number; payload?: Linha };

// A escala é linear: a caixa vai de x (Q1) a x + width (Q3), então qualquer valor
// se converte em pixel a partir dessa proporção. Os bigodes param na borda da
// caixa em vez de atravessá-la; só a mediana é desenhada dentro.
function Caixa({ x = 0, y = 0, width = 0, height = 0, payload }: CaixaProps) {
	const navigate = useNavigate();
	if (!payload) return null;
	const [q1, q3] = payload.caixa;
	const [aoMin, aoMax] = payload.bigodes;
	const pxPorUnidade = q3 > q1 ? width / (q3 - q1) : 0;
	const mediana = q3 > q1 ? x + (payload.mediana - q1) * pxPorUnidade : x + width / 2;
	const minX = x + width - aoMin * pxPorUnidade;
	const maxX = x + width + aoMax * pxPorUnidade;
	const meioY = y + height / 2;
	const capa = height / 3;
	const bigode = { stroke: "var(--muted-foreground)", strokeWidth: 2 };

	return (
		<g>
			<line x1={minX} x2={x} y1={meioY} y2={meioY} {...bigode} />
			<line x1={minX} x2={minX} y1={meioY - capa} y2={meioY + capa} {...bigode} />
			<line x1={x + width} x2={maxX} y1={meioY} y2={meioY} {...bigode} />
			<line x1={maxX} x2={maxX} y1={meioY - capa} y2={meioY + capa} {...bigode} />
			<rect x={x} y={y} width={width} height={height} rx={4} fill={payload.cor} />
			<line x1={mediana} x2={mediana} y1={y} y2={y + height} stroke="var(--card)" strokeWidth={2} />
			{payload.outliers.map((outlier) => {
				const href = `/amostras/${outlier.id}`;
				return (
					<Tooltip key={outlier.id}>
						<TooltipTrigger
							render={
								<a
									href={href}
									aria-label={`Amostra #${outlier.id}`}
									onClick={(event) => {
										event.preventDefault();
										navigate(href);
									}}
									className="cursor-pointer"
								/>
							}
						>
							<circle
								cx={x + (outlier.valor - q1) * pxPorUnidade}
								cy={meioY}
								r={4}
								fill="var(--card)"
								stroke={payload.cor}
								strokeWidth={2}
							/>
						</TooltipTrigger>
						<TooltipContent>{`Amostra #${outlier.id}: ${formatBrl(outlier.valor)}`}</TooltipContent>
					</Tooltip>
				);
			})}
		</g>
	);
}
