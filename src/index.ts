export type PineError = { kind: string };

export type PineType<T, E extends PineError> =
	| { success: true; data: T }
	| { success: false; error: E };
