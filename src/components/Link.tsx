interface LinkProps {
  href?: string | undefined;
  text?: string | undefined;
}

export function Link({ href, text }: LinkProps) {
  return (
    <a
      className="text-blue-500 hover:text-blue-700 underline text-sm"
      href={href ?? "#"}
    >
      {text ?? ""}
    </a>
  );
}
