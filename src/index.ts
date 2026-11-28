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
	): PineApple<R, { kind: K; cause: unknown }> {
		try {
			const r = fun();
			return PineApple.ok(r);
		} catch (cause) {
			return PineApple.error({ kind, cause });
		}
	}

	public static settle<
		const P extends PineApple<any, any extends PineError ? any : never>[],
	>(
		pines: P,
	): PineApple<
		{ [K in keyof P]: P[K] extends PineApple<infer T, any> ? T : never },
		{
			kind: "SettlementError";
			errors: {
				[K in keyof P]: P[K] extends PineApple<any, infer E> ? E : never;
			};
		}
	> {
		const data: unknown[] = [];
		const errors: unknown[] = [];
		let failed = false;

		for (const { value } of pines) {
			data.push(value.success ? value.data : undefined);
			errors.push(value.success ? undefined : value.error);
			if (!value.success) failed = true;
		}

		if (failed)
			return PineApple.error({
				kind: "SettlementError",
				errors: errors as any,
			});
		return PineApple.ok(data as any);
	}

	public static readonly promise = {
		attempt: async <R, K extends string>(
			fun: () => Promise<R>,
			kind: K,
		): Promise<PineApple<R, { kind: K; cause: unknown }>> => {
			try {
				const r = await fun();
				return PineApple.ok(r);
			} catch (cause) {
				return PineApple.error({ kind, cause });
			}
		},

		settle: async <
			const P extends Promise<
				PineApple<any, any extends PineError ? any : never>
			>[],
		>(
			pines: P,
		): Promise<
			PineApple<
				{ [K in keyof P]: P[K] extends PineApple<infer T, any> ? T : never },
				{
					kind: "SettlementError";
					errors: {
						[K in keyof P]: P[K] extends PineApple<any, infer E> ? E : never;
					};
				}
			>
		> => {
			const data: unknown[] = [];
			const errors: unknown[] = [];
			let failed = false;

			for (const pine of pines) {
				const { outcome } = await pine;
				data.push(outcome.success ? outcome.data : undefined);
				errors.push(outcome.success ? undefined : outcome.error);
				if (!outcome.success) failed = true;
			}

			if (failed)
				return PineApple.error({
					kind: "SettlementError",
					errors: errors as any,
				});
			return PineApple.ok(data as any);
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

	public chainError<R, const F extends PineError>(
		fun: (data: E) => PineApple<R, F>,
	): PineApple<T | R, F> {
		if (!this.value.success) {
			const p = fun(this.value.error);
			if (p.value.success) return PineApple.ok(p.value.data);
			return PineApple.error(p.value.error);
		}
		return PineApple.ok(this.value.data);
	}

	public get promise() {
		return {
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

			chainError: async <R, const F extends PineError>(
				fun: (data: E) => Promise<PineApple<R, F>>,
			): Promise<PineApple<T | R, F>> => {
				if (!this.value.success) {
					const p = await fun(this.value.error);
					if (p.value.success) return PineApple.ok(p.value.data);
					return PineApple.error(p.value.error);
				}
				return PineApple.ok(this.value.data);
			},
		};
	}

	public nth<U>(
		this: PineApple<U[], E>,
		n: number,
	): PineApple<
		U,
		E | { kind: "IndexOutOfBounds"; index: number; length: number }
	> {
		if (this.value.success) {
			const e = this.value.data.at(n);
			if (typeof e !== "undefined") return PineApple.ok(e);
			return PineApple.error({
				kind: "IndexOutOfBounds",
				index: n,
				length: this.value.data.length,
			});
		}
		return PineApple.error(this.value.error);
	}

	public consume<C>(consumers: {
		[K in E["kind"]]: (error: Extract<E, { kind: K }>) => C;
	}): PineApple<T, { kind: "Consumed"; object: C }> {
		if (this.value.success) return PineApple.ok(this.value.data);
		const e = this.value.error;
		const consume = consumers[e.kind as E["kind"]] as (e: E) => C;
		return PineApple.error<T, { kind: "Consumed"; object: C }>({
			kind: "Consumed",
			object: consume(e),
		});
	}

	public get outcome(): PineType<T, E> {
		return this.value;
	}
}
