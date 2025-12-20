import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { autoIncrement } from './autoincrement.ts';

suite('autoIncrement()', () => {
    test('Increments IDs for different tables', () => {
        const one = autoIncrement('one');
        autoIncrement('two');
        const two = autoIncrement('two');

        assert.strictEqual(one, 1);
        assert.strictEqual(two, 2);
    });
});
