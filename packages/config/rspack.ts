import type { RspackOptions, SwcLoaderOptions } from '@rspack/core';

const TS_FILE_REGEX = /\.ts$/;

export function rspackConfig(): RspackOptions {
    return {
        devtool: false,
        module: {
            rules: [
                {
                    test: TS_FILE_REGEX,
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                            },
                        },
                    } satisfies SwcLoaderOptions,
                },
            ],
        },
        output: {
            filename: 'index.js',
        },
        resolve: {
            extensions: ['.ts'],
        },
        target: ['node', 'es2025'],
    };
}
