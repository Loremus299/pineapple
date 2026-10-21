import Result, { DocumentedFunction } from ".";

export function cli<
	T,
	E,
	F extends (...args: any[]) => Result<T, E> | Promise<Result<T, E>>,
>(raw: DocumentedFunction<T, E, F>) {
	let title = `----| ${raw.name} - ${raw.title} |----`;

	const positionArgLines: string[] = [];
	const positionalArgs = raw.parameters.pop() as { [key: string]: unknown };
	for (const [k, v] of Object.entries(positionalArgs)) {
		positionArgLines.push(`${k}: ${v}`);
	}

	const nameArgLines: string[] = [];
	const namedArgs = raw.parameters.at(-1) as { [key: string]: unknown };
	for (const [k, v] of Object.entries(namedArgs)) {
		nameArgLines.push(`${k}: ${v}`);
	}
	return [
		title,
		"",
		"----| POSITIONAL ARGUMENTS | ---",
		...positionArgLines,
		"",
		"----| NAMED ARGUMENTS | ---",
		...nameArgLines,
	];
}
