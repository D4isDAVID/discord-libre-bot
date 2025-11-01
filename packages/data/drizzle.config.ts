import { defineConfig } from 'drizzle-kit';

// biome-ignore lint/style/noDefaultExport: required by drizzle orm
export default defineConfig({
    out: './drizzle',
    schema: './src/schema/index.ts',
    dialect: 'postgresql',
});
