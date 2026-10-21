import Result from ".";
import { cli, Cli } from "./docs";

function deploy(
	[project, staging]: [project: string, staging?: string],
	{
		flags,
		env,
		configs,
	}: {
		flags: { "dry-run"?: string };
		env: { DEPLOYMENT_TOKEN: string };
		configs: { "vercel.json": string };
	},
): Result<{}, {}> {
	if (Math.random() > 0.5) return Result.ok({});
	return Result.error({});
}

const raw = Result.documentFunction<unknown, unknown, typeof deploy, Cli>(
	"Deploy your code in cwd using vercel",
	deploy,
	{
		args: [
			[
				{ metadata: "Project name to deploy" },
				{ metadata: "Staging environment" },
			],
			{
				flags: {
					"dry-run": {
						metadata: "Build once and showase before deployment",
						alias: "-d",
					},
				},
				env: {
					DEPLOYMENT_TOKEN: { metadata: "Deployment token" },
				},
				configs: {
					"vercel.json": { metadata: "Vercel configuration" },
				},
			},
		],
		success: {},
		error: {},
	},
);
