import Result, { DocumentedFunction } from ".";

export type Cli = { metadata: string; alias?: string };

export function cli<
	T,
	E,
	F extends (...args: any[]) => Result<T, E> | Promise<Result<T, E>>,
>(raw: DocumentedFunction<T, E, F, Cli>) {}
