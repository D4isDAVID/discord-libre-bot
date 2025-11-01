import type { LogPayload } from '../strategies/stream.ts';

export function jsonFormatter(log: LogPayload): string {
    return `${JSON.stringify(log)}\n`;
}
