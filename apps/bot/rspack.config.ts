import { rspackConfig } from '@internal/config/rspack';
import { IgnorePlugin } from '@rspack/core';

// biome-ignore lint/style/noDefaultExport: required by rspack
export default rspackConfig({
    plugins: [
        new IgnorePlugin({
            resourceRegExp: /utf-8-validate/,
        }),
    ],
});
