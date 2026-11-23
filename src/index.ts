export type PineError = { kind: string };

export type PineType<T, E extends PineError> =
	| { success: true; data: T }
	| { success: false; error: E };

export default class PineApple<T, const E extends PineError> {
	private constructor(private readonly value: PineType<T, E>) {}

	public static ok<T, E extends PineError>(data: T): PineApple<T, E> {
		return new PineApple<T, E>({ success: true, data });
	}

	public static error<T, const E extends PineError>(error: E): PineApple<T, E> {
		return new PineApple<T, E>({ success: false, error });
	}

	public static async tryCatch<T, K extends string>(
		fun: () => Promise<T>,
		kind: K,
	): Promise<PineApple<T, { kind: K; error: unknown }>> {
		try {
			return PineApple.ok(await fun());
		} catch (error) {
			return PineApple.error({ kind, error });
		}
	}

	public mapOk<R>(fun: (data: T) => R): PineApple<R, E> {
		if (this.value.success) {
			return PineApple.ok(fun(this.value.data));
		}
		return PineApple.error(this.value.error);
	}

	public async mapOkAsync<R>(
		fun: (data: T) => Promise<R>,
	): Promise<PineApple<R, E>> {
		if (this.value.success) {
			return PineApple.ok(await fun(this.value.data));
		}
		return PineApple.error(this.value.error);
	}
}
