import z from "zod";

interface OpenAPIResponse {
	[status: string]: {
		description: string;
		content: {
			[contentType: string]: {
				schema: unknown;
			};
		};
	};
}

interface OpenAPIOperation {
	summary?: string;
	description?: string;
	tags?: string[];

	responses: OpenAPIResponse;
}

interface OpenAPIPath {
	[path: string]: {
		[method: string]: OpenAPIOperation;
	};
}

interface OpenAPIBaseObject {
	openapi: string;
	info: {
		title: string;
		version: string;
	};
	paths: OpenAPIPath;
}

type Method =
	| "get"
	| "post"
	| "put"
	| "patch"
	| "delete"
	| "head"
	| "options"
	| "trace";

export class OpenAPIBasePath {
	private readonly operation: OpenAPIOperation;

	constructor(ctx: OpenAPIPath, path: string, method: Method) {
		ctx[path] ??= {};

		this.operation = ctx[path][method] ??= {
			responses: {},
		};
	}

	public response(
		status: number,
		description: string,
		type: string,
		zod: z.ZodObject,
	) {
		this.operation.responses[String(status)] = {
			description,
			content: {
				[type]: {
					schema: zod.toJSONSchema({
						target: "openapi-3.0",
					}),
				},
			},
		};

		return this;
	}

	public responses(
		response: Record<
			number,
			{
				description: string;
				type: string;
				zod: z.ZodObject;
			}
		>,
	) {
		for (const [status, details] of Object.entries(response)) {
			this.response(
				Number(status),
				details.description,
				details.type,
				details.zod,
			);
		}

		return this;
	}
}

export default class OpenAPI {
	private readonly ctx: OpenAPIBaseObject;

	constructor(openapi: string, info: { title: string; version: string }) {
		this.ctx = {
			openapi,
			info,
			paths: {},
		};
	}

	public path(path: string, method: Method) {
		return new OpenAPIBasePath(this.ctx.paths, path, method);
	}

	public get json() {
		return this.ctx;
	}
}
