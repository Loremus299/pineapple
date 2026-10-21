export type ResultType<T, E> =
	| { success: true; data: T }
	| { success: false; error: E };

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

	public static async fallback<T, E, V>(
		data: V,
		defaultError: E,
		funs: Array<(arg: V) => Promise<Result<T, E>>>,
	): Promise<Result<T, E>> {
		let lastError: E = defaultError;

		for (const fun of funs) {
			const res: Result<T, E> = await fun(data);
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
			{ [K in keyof Vs]: Vs[K] extends Result<infer T, unknown> ? T : never },
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
				[K in keyof Vs]: Vs[K] extends Result<infer T, unknown> ? T : never;
			},
		);
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

	public static documentFunction<
		T,
		E,
		F extends (...args: any[]) => Result<T, E> | Promise<Result<T, E>>,
	>(
		title: string,
		fun: F,
		meta: {
			args: DocumentedArgs<Parameters<F>>;
			success: Awaited<ReturnType<F>> extends Result<infer T, E> ? T : never;
			error: Awaited<ReturnType<F>> extends Result<T, infer E> ? E : never;
		},
	): DocumentedFunction<T, E, F> {
		return {
			title,
			name: fun.name,
			parameters: meta.args,
			success: meta.success,
			error: meta.error,
			source: fun.toString(),
		};
	}
}

export type DocumentedFunction<
	T,
	E,
	F extends (...args: any[]) => Result<T, E> | Promise<Result<T, E>>,
> = {
	title: string;
	name: string;
	parameters: DocumentedArgs<Parameters<F>>;
	success: Awaited<ReturnType<F>> extends Result<infer T, E> ? T : never;
	error: Awaited<ReturnType<F>> extends Result<T, infer E> ? E : never;
	source: string;
};

type DocumentedArgs<P extends unknown[]> = {
	[K in keyof P]-?: unknown;
};
