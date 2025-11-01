import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import { LogLevel } from './base.ts';
import { MockLogger } from './strategies/mock.ts';

suite('Logger', () => {
    const logFn = mock.fn();
    const logger = new MockLogger(logFn);

    beforeEach(() => {
        logFn.mock.resetCalls();
    });

    suite('trace()', () => {
        test('Calls log() with LogLevel.Trace', () => {
            logger.trace('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Trace,
            );
        });
    });

    suite('debug()', () => {
        test('Calls log() with LogLevel.Debug', () => {
            logger.debug('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Debug,
            );
        });
    });

    suite('info()', () => {
        test('Calls log() with LogLevel.Info', () => {
            logger.info('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Info,
            );
        });
    });

    suite('warn()', () => {
        test('Calls log() with LogLevel.Warn', () => {
            logger.warn('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Warn,
            );
        });
    });

    suite('error()', () => {
        test('Calls log() with LogLevel.Error', () => {
            logger.error('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Error,
            );
        });
    });

    suite('fatal()', () => {
        test('Calls log() with LogLevel.Fatal', () => {
            logger.fatal('test');

            assert.strictEqual(logFn.mock.callCount(), 1);
            assert.strictEqual(
                logFn.mock.calls[0]?.arguments[0],
                LogLevel.Fatal,
            );
        });
    });
});
