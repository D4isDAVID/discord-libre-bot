import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { defineConfig } from '@rspack/cli';
import type { SwcLoaderOptions } from '@rspack/core';

const tsFilesRegex = /\.ts$/;
const nodeFilesRegex = /\.node$/;

export function rspackConfig() {
    const projectDir = cwd();

    return defineConfig({
        entry: resolve(projectDir, './src/index.ts'),
        output: {
            filename: 'index.js',
            path: resolve(projectDir, 'dist'),
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
        target: ['node', 'es2025'],
    });
}
