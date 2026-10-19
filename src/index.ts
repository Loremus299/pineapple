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

type Method =
	| "get"
	| "post"
	| "put"
	| "patch"
	| "delete"
	| "head"
	| "options"
	| "trace";

interface OpenAPIObject {
	openapi: string;
	info: {
		title: string;
		version: string;
	};
	paths: OpenAPIPath;
}
