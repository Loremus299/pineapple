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

interface OpenAPIObject {
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

export class OpenAPI {
	private readonly ctx: OpenAPIObject;

	constructor(openapi: string, info: { title: string; version: string }) {
		this.ctx = {
			openapi,
			info,
			paths: {},
		};
	}

	public path(
		path: string,
		method: Method,
		{
			summary,
			description,
			tags,
		}: { summary?: string; description?: string; tags?: string[] },
	) {
		this.ctx.paths[path] ??= {};

		this.ctx.paths[path][method] = {
			...(summary && { summary: summary }),
			...(description && { description: description }),
			...(tags && { tags: tags }),
			responses: {},
		};
	}

	public response(
		path: string,
		method: Method,
		status: number,
		description: string,
		type: string,
		zodSchema: z.ZodObject,
	) {
		this.ctx.paths[path] ??= {};
		this.ctx.paths[path][method].responses[String(status)] = {
			description,
			content: {
				[type]: { schema: zodSchema.toJSONSchema({ target: "openapi-3.0" }) },
			},
		};
	}
}
