import { defineConfig } from 'drizzle-kit';

// biome-ignore lint/style/noDefaultExport: required by drizzle-kit
export default defineConfig({
    out: './drizzle',
    schema: './src/drizzle-orm/schema/index.ts',
    dialect: 'postgresql',
});
