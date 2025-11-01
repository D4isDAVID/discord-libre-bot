import {
    blue,
    type Format,
    gray,
    red,
    redBright,
    reset,
    yellowBright,
} from 'yoctocolors';
import { LogLevel } from '../base.ts';
import type { LogPayload } from '../strategies/stream.ts';
import { prettyFormatter } from './pretty.ts';

const logLevelToColor: Record<LogLevel, Format> = {
    [LogLevel.Trace]: gray,
    [LogLevel.Debug]: blue,
    [LogLevel.Info]: reset,
    [LogLevel.Warn]: yellowBright,
    [LogLevel.Error]: red,
    [LogLevel.Fatal]: redBright,
};

export function prettyColoredFormatter(log: LogPayload): string {
    return logLevelToColor[log.level](prettyFormatter(log));
}
