import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBrl } from "@/lib/format";
import { CORES_HISTOGRAMA, chaveSerie, histogramaFaixas, type SerieHistograma } from "./histograma";

const QUANTIDADE_FAIXAS = 60;
// Mesmas margens do gráfico, para o tapete ficar alinhado com as barras.
const LARGURA_EIXO_Y = 48;
const MARGEM_DIREITA = 16;

export function HistogramaChart({ series }: { series: SerieHistograma[] }) {
	const { faixas, dominio } = histogramaFaixas(series, QUANTIDADE_FAIXAS);

	if (faixas.length === 0) return null;

	const [menor, maior] = dominio;
	const chartConfig = Object.fromEntries(
		series.map((serie, indice) => [
			chaveSerie(indice),
			{ label: serie.nome, color: CORES_HISTOGRAMA[indice % CORES_HISTOGRAMA.length] },
		]),
	) satisfies ChartConfig;

	return (
		<div className="flex flex-col gap-1">
			{/* Tapete: um risco por amostra, uma linha por série, na mesma escala do eixo. */}
			<div
				className="flex flex-col gap-1"
				style={{ paddingLeft: LARGURA_EIXO_Y, paddingRight: MARGEM_DIREITA }}
			>
				{series.map((serie, indice) => (
					<svg
						key={serie.nome}
						role="img"
						aria-label={`Tapete de ${serie.nome}`}
						viewBox={`${menor} 0 ${maior - menor} 1`}
						preserveAspectRatio="none"
						className="h-3 w-full"
					>
						{serie.valores.map((valor, posicao) => (
							<line
								// biome-ignore lint/suspicious/noArrayIndexKey: valores repetidos são riscos distintos
								key={posicao}
								x1={valor}
								x2={valor}
								y1={0}
								y2={1}
								stroke={CORES_HISTOGRAMA[indice % CORES_HISTOGRAMA.length]}
								strokeOpacity={0.6}
								strokeWidth={1}
								vectorEffect="non-scaling-stroke"
							/>
						))}
					</svg>
				))}
			</div>

			<ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
				<BarChart
					accessibilityLayer
					data={faixas}
					barCategoryGap={1}
					margin={{ top: 8, right: MARGEM_DIREITA, bottom: 8, left: 0 }}
				>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="centro"
						type="number"
						domain={dominio}
						tickCount={6}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: number) => formatBrl(value)}
					/>
					<YAxis width={LARGURA_EIXO_Y} allowDecimals={false} tickLine={false} axisLine={false} />
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(_, payload) => {
									const faixa = payload?.[0]?.payload;
									return faixa ? `${formatBrl(faixa.inicio)} a ${formatBrl(faixa.fim)}` : null;
								}}
							/>
						}
					/>
					{series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
					{/* Cada série num eixo X próprio (escondido) para as barras se sobreporem
					    em vez de ficarem lado a lado. */}
					{series.map((serie) => (
						<XAxis
							key={serie.nome}
							xAxisId={serie.nome}
							dataKey="centro"
							type="number"
							domain={dominio}
							hide
						/>
					))}
					{series.map((serie, indice) => (
						<Bar
							key={serie.nome}
							xAxisId={serie.nome}
							dataKey={`contagens.${chaveSerie(indice)}`}
							name={chaveSerie(indice)}
							fill={`var(--color-${chaveSerie(indice)})`}
							fillOpacity={0.8}
							isAnimationActive={false}
						/>
					))}
				</BarChart>
			</ChartContainer>
		</div>
	);
}
