import { rspackConfig } from '@internal/configs';
import { IgnorePlugin } from '@rspack/core';

// biome-ignore lint/style/noDefaultExport: rspack requires this
export default rspackConfig({
    plugins: [
        new IgnorePlugin({
            resourceRegExp: /pg-native|utf-8-validate/,
        }),
    ],
});
