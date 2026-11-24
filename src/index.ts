export type PineError = { kind: string };

export type PineType<T, E extends PineError> =
	| { success: true; data: T }
	| { success: false; error: E };

export default class PineApple<T, const E extends PineError> {
	private constructor(private readonly value: PineType<T, E>) {}

	public static ok<T, const E extends PineError>(data: T) {
		return new PineApple<T, E>({ success: true, data });
	}

	public static error<T, const E extends PineError>(error: E) {
		return new PineApple<T, E>({ success: false, error });
	}
}
