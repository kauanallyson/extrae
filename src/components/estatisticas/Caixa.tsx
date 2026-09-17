import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBrl } from "@/lib/format";
import type { Linha } from "./distribuicao";

type CaixaProps = { x?: number; y?: number; width?: number; height?: number; payload?: Linha };

// A escala é linear: a caixa vai de x (Q1) a x + width (Q3), então qualquer valor
// se converte em pixel a partir dessa proporção. Os bigodes param na borda da
// caixa em vez de atravessá-la; só a mediana é desenhada dentro.
export function Caixa({ x = 0, y = 0, width = 0, height = 0, payload }: CaixaProps) {
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
								// biome-ignore lint/a11y/useAnchorContent: o conteúdo (círculo) vem dos filhos do TooltipTrigger
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
