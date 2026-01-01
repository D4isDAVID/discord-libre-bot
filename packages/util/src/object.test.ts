import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { mapObject } from './object.ts';

suite('mapObject()', () => {
    test('Maps object values', () => {
        const object = {
            a: 1,
            b: 2,
            c: 3,
        };

        const mapped = mapObject(object, (v) => v * 10);

        assert.deepStrictEqual(mapped, {
            a: 10,
            b: 20,
            c: 30,
        });
    });
});
