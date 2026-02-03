import { join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { defineConfig } from '@rspack/cli';
import {
    CopyRspackPlugin,
    type RspackOptions,
    type SwcLoaderOptions,
} from '@rspack/core';

const tsFilesRegex = /\.ts$/;
const nodeFilesRegex = /\.node$/;

export function rspackConfig(options: Omit<RspackOptions, 'target'> = {}) {
    const projectDir = cwd();
    const rootDir = join(projectDir, '../..');
    const drizzleDir = join(rootDir, './packages/data/drizzle');

    return defineConfig({
        ...options,
        entry: resolve(projectDir, './src/index.ts'),
        output: {
            ...options.output,
            filename: 'index.js',
            path: resolve(projectDir, 'dist'),
            module: true,
        },
        experiments: {
            ...options.experiments,
            outputModule: true,
        },
        resolve: {
            ...options.resolve,
            tsConfig: {
                configFile: resolve(projectDir, './tsconfig.json'),
            },
            extensions: ['.ts', '.js'],
        },
        module: {
            ...options.module,
            rules: [
                ...(options.module?.rules || []),
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
            ...(options.plugins || []),
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
