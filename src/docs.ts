import Result, { DocumentedFunction } from ".";

export function cli<
	T,
	E,
	F extends (...args: any[]) => Result<T, E> | Promise<Result<T, E>>,
>(raw: DocumentedFunction<T, E, F>) {}
