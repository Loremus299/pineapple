export type ResultType<T, E> =
	| { success: true; data: T }
	| { success: false; error: E };

export const NoRows = Symbol("NoRows");

export default class Result<T, E> {
	private readonly value: ResultType<T, E>;

	private constructor(value: ResultType<T, E>) {
		this.value = value;
	}

	public static ok<T, E>(data: T): Result<T, E> {
		return new Result<T, E>({ success: true, data });
	}

	public static error<T, E>(error: E): Result<T, E> {
		return new Result<T, E>({ success: false, error });
	}

	public static async fallback<T, E>(
		defaultError: E,
		funs: Array<() => Promise<Result<T, E>>>,
	): Promise<Result<T, E>> {
		let lastError: E = defaultError;

		for (const fun of funs) {
			const res: Result<T, E> = await fun();
			if (res.value.success) {
				return res;
			}

			lastError = res.value.error;
		}

		return Result.error<T, E>(lastError);
	}

	public static async tryCatch<T, V>(
		fun: () => Promise<T>,
	): Promise<Result<T, unknown>> {
		try {
			const res = await fun();
			return Result.ok(res);
		} catch (error) {
			return Result.error(error);
		}
	}

	public static async settle<
		const Vs extends Array<Promise<Result<unknown, unknown>>>,
	>(
		results: Vs,
	): Promise<
		Result<
			{
				[K in keyof Vs]: Vs[K] extends Promise<Result<infer T, unknown>>
					? T
					: never;
			},
			null
		>
	> {
		const settled: unknown[] = [];
		for (const result of results) {
			const res = await result;
			if (!res.value.success) {
				return Result.error(null);
			} else {
				settled.push(res.value.data);
			}
		}

		return Result.ok(
			settled as {
				[K in keyof Vs]: Vs[K] extends Promise<Result<infer T, unknown>>
					? T
					: never;
			},
		);
	}
	public one<TA, F>(this: Result<TA[], F>): Result<TA, F | typeof NoRows> {
		if (!this.value.success) return Result.error(this.value.error);
		if (this.value.data.length === 0) return Result.error(NoRows);
		return Result.ok(this.value.data[0] as TA);
	}

	public match<R>(onOk: (t: T) => R, onErr: (e: E) => R): R {
		return this.value.success ? onOk(this.value.data) : onErr(this.value.error);
	}

	public mapOk<R>(fun: (arg: T) => R): Result<R, E> {
		return this.value.success
			? Result.ok<R, E>(fun(this.value.data))
			: Result.error<R, E>(this.value.error);
	}

	public mapError<F>(fun: (arg: E) => F): Result<T, F> {
		return this.value.success
			? Result.ok<T, F>(this.value.data)
			: Result.error<T, F>(fun(this.value.error));
	}

	public unrelated(fun: () => unknown): Result<T, E> {
		fun();
		return this;
	}

	public onOk(fun: (arg: T) => unknown): Result<T, E> {
		if (this.value.success) {
			fun(this.value.data);
		}
		return this;
	}

	public onError(fun: (arg: E) => unknown): Result<T, E> {
		if (!this.value.success) {
			fun(this.value.error);
		}
		return this;
	}

	public get type() {
		return this.value as ResultType<T, E>;
	}

	public get outcome() {
		return this.value;
	}
}
