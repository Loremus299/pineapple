import { PineError, PineType } from "./types";

export default class PineApple<T, const E extends PineError> {
	private constructor(private readonly value: PineType<T, E>) {}

	public static ok<T, const E extends PineError>(data: T) {
		return new PineApple<T, E>({ success: true, data });
	}

	public static error<T, const E extends PineError>(error: E) {
		return new PineApple<T, E>({ success: false, error });
	}

	public get outcome(): PineType<T, E> {
		return this.value;
	}
}
