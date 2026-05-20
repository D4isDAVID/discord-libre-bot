import type { RspackOptions, SwcLoaderOptions } from '@rspack/core';

const TS_FILE_REGEX = /\.ts$/;
const NODE_FILE_REGEX = /\.node$/;

export function rspackConfig({
    plugins = [],
}: Pick<RspackOptions, 'plugins'> = {}): RspackOptions {
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
                {
                    test: NODE_FILE_REGEX,
                    loader: 'node-loader',
                },
            ],
        },
        output: {
            filename: 'index.js',
        },
        plugins,
        resolve: {
            extensions: ['.js', '.ts'],
        },
        target: ['node', 'es2025'],
    };
}
