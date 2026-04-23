import { type AnchorHTMLAttributes, forwardRef } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	({ href, className, children, ...props }, ref) => {
		return (
			<a
				ref={ref}
				href={href ?? "#"}
				className={`w-fit text-blue-500 hover:text-blue-700 underline text-sm ${className?.trim() ?? ""}`}
				{...props}
			>
				{children}
			</a>
		);
	},
);
