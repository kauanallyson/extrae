import type { AnchorHTMLAttributes } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function Link({ href, className, children, ...props }: LinkProps) {
  return (
    <a
      href={href ?? "#"}
      className={`w-fit text-blue-500 hover:text-blue-700 underline text-sm ${className?.trim() ?? ""}`}
      {...props}
    >
      {children}
    </a>
  );
}
