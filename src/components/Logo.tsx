import { cn } from "../lib/utils";

type LogoProps = {
	className?: string;
	size?: number;
};

export function Logo({ className, size = 28 }: LogoProps) {
	return (
		<img
			src="/favicon.svg"
			alt="EXTRAE"
			width={size}
			height={size}
			className={cn("shrink-0", className)}
		/>
	);
}
