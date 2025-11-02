import { join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { defineConfig } from '@rspack/cli';
import { CopyRspackPlugin, type SwcLoaderOptions } from '@rspack/core';

const tsFilesRegex = /\.ts$/;
const nodeFilesRegex = /\.node$/;

export function rspackConfig() {
    const projectDir = cwd();
    const rootDir = join(projectDir, '../..');
    const drizzleDir = join(rootDir, './packages/data/drizzle');

    return defineConfig({
        entry: resolve(projectDir, './src/index.ts'),
        output: {
            filename: 'index.js',
            path: resolve(projectDir, 'dist'),
            module: true,
        },
        experiments: {
            outputModule: true,
        },
        resolve: {
            tsConfig: {
                configFile: resolve(projectDir, './tsconfig.json'),
            },
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: tsFilesRegex,
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                            },
                        },
                    } satisfies SwcLoaderOptions,
                },
                {
                    test: nodeFilesRegex,
                    loader: 'node-loader',
                },
            ],
        },
        plugins: [
            new CopyRspackPlugin({
                patterns: [
                    {
                        from: drizzleDir,
                        to: 'drizzle',
                    },
                ],
            }),
        ],
        target: ['node', 'es2025'],
    });
}
