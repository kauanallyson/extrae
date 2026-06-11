import type { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

type ErrorNode = Record<string, unknown>;

function assignFieldError(errors: ErrorNode, path: PropertyKey[], message: string) {
	let cursor = errors;
	for (const segment of path.slice(0, -1)) {
		const key = String(segment);
		cursor[key] = (cursor[key] as ErrorNode | undefined) ?? {};
		cursor = cursor[key] as ErrorNode;
	}

	const key = String(path.at(-1));
	cursor[key] = { type: "validation", message } satisfies FieldError;
}

export function createZodResolver<TFieldValues extends FieldValues>(
	schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
	return async (values) => {
		const result = schema.safeParse(values);
		if (result.success) return { values: result.data, errors: {} };

		const errors: ErrorNode = {};
		for (const issue of result.error.issues) {
			assignFieldError(errors, issue.path, issue.message);
		}

		return { values: {}, errors: errors as FieldErrors<TFieldValues> };
	};
}
