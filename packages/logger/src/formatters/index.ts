import { jsonFormatter } from './json.ts';
import { prettyFormatter } from './pretty.ts';
import { prettyColoredFormatter } from './pretty-colored.ts';

export * from './json.ts';
export * from './pretty.ts';
export * from './pretty-colored.ts';

export const formatters = {
    json: jsonFormatter,
    pretty: prettyFormatter,
    prettyColored: prettyColoredFormatter,
};
