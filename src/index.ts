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

type ContentType =
	| string
	| "application/json"
	| "application/xml"
	| "application/pdf"
	| "application/zip"
	| "application/x-www-form-urlencoded"
	| "audio/mpeg"
	| "audio/x-wav"
	| "image/gif"
	| "image/png"
	| "image/jpeg"
	| "image/tiff"
	| "image/x-icon"
	| "image/svg-xml"
	| "multipart/form-data"
	| "text/plain"
	| "text/csv"
	| "text/xml"
	| "text/html"
	| "text/css"
	| "text/javascript"
	| "video/mpeg"
	| "video/mp4"
	| "video/quicktime"
	| "video/webm";

interface OpenAPIObject {
	openapi: string;
	info: {
		title: string;
		version: string;
	};
	paths: OpenAPIPath;
}
