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

	public static attempt<R, K extends string>(
		fun: () => R,
		kind: K,
	): PineApple<R, { kind: K; error: unknown }> {
		try {
			const r = fun();
			return PineApple.ok(r);
		} catch (error) {
			return PineApple.error({ kind, error });
		}
	}

	public static readonly promise = {
		attempt: async <R, K extends string>(
			fun: () => Promise<R>,
			kind: K,
		): Promise<PineApple<R, { kind: K; error: unknown }>> => {
			try {
				const r = await fun();
				return PineApple.ok(r);
			} catch (error) {
				return PineApple.error({ kind, error });
			}
		},
	};

	public onOk(fun: (data: T) => unknown): PineApple<T, E> {
		if (this.value.success) {
			fun(this.value.data);
			return PineApple.ok(this.value.data);
		}
		return PineApple.error(this.value.error);
	}

	public onError(fun: (data: E) => unknown): PineApple<T, E> {
		if (!this.value.success) {
			fun(this.value.error);
			return PineApple.error(this.value.error);
		}
		return PineApple.ok(this.value.data);
	}

	public mapOk<R>(fun: (data: T) => R): PineApple<R, E> {
		if (this.value.success) return PineApple.ok(fun(this.value.data));
		return PineApple.error(this.value.error);
	}

	public mapError<const F extends PineError>(
		fun: (data: E) => F,
	): PineApple<T, F> {
		if (!this.value.success) return PineApple.error(fun(this.value.error));
		return PineApple.ok(this.value.data);
	}

	public chainOk<R, const F extends PineError>(
		fun: (data: T) => PineApple<R, F>,
	): PineApple<R, E | F> {
		if (this.value.success) {
			const p = fun(this.value.data);
			if (p.value.success) return PineApple.ok(p.value.data);
			return PineApple.error(p.value.error);
		}
		return PineApple.error(this.value.error);
	}

	public readonly promise = {
		onOk: async (
			fun: (data: T) => Promise<unknown>,
		): Promise<PineApple<T, E>> => {
			if (this.value.success) {
				await fun(this.value.data);
				return PineApple.ok(this.value.data);
			}
			return PineApple.error(this.value.error);
		},

		onError: async (
			fun: (data: E) => Promise<unknown>,
		): Promise<PineApple<T, E>> => {
			if (!this.value.success) {
				await fun(this.value.error);
				return PineApple.error(this.value.error);
			}
			return PineApple.ok(this.value.data);
		},

		mapOk: async <R>(
			fun: (data: T) => Promise<R>,
		): Promise<PineApple<R, E>> => {
			if (this.value.success) return PineApple.ok(await fun(this.value.data));
			return PineApple.error(this.value.error);
		},

		mapError: async <const F extends PineError>(
			fun: (data: E) => Promise<F>,
		): Promise<PineApple<T, F>> => {
			if (!this.value.success)
				return PineApple.error(await fun(this.value.error));
			return PineApple.ok(this.value.data);
		},

		chainOk: async <R, const F extends PineError>(
			fun: (data: T) => Promise<PineApple<R, F>>,
		): Promise<PineApple<R, E | F>> => {
			if (this.value.success) {
				const p = await fun(this.value.data);
				if (p.value.success) return PineApple.ok(p.value.data);
				return PineApple.error(p.value.error);
			}
			return PineApple.error(this.value.error);
		},
	};

	public get outcome(): PineType<T, E> {
		return this.value;
	}
}
