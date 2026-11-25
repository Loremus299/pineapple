import PineApple from ".";
import { PineError } from "./types";

export default class PineAsync<T, const E extends PineError> {
	private constructor(private readonly promise: Promise<PineApple<T, E>>) {}

	public then<R>(onOk: (p: PineApple<T, E>) => R | PromiseLike<R>): Promise<R>;
	public then(
		onOk: (p: PineApple<T, E>) => unknown,
		onErr?: (e: unknown) => unknown,
	) {
		return this.promise.then(onOk, onErr);
	}

	public static tryCatch<T, K extends string>(
		fun: () => Promise<T>,
		kind: K,
	): PineAsync<T, { kind: K; error: unknown }> {
		return new PineAsync(
			(async (): Promise<PineApple<T, { kind: K; error: unknown }>> => {
				try {
					return PineApple.ok(await fun());
				} catch (error) {
					return PineApple.error({ kind, error });
				}
			})(),
		);
	}
}
