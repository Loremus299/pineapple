import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts", "./src/drizzle/pg/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
});
