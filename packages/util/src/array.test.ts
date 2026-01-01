import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { chunkArray } from './array.ts';
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

suite('chunkArray()', () => {
    test('Chunks an array into pieces', () => {
        const array = [1, 2, 3, 4, 5, 6];

        const chunks = chunkArray(array, 2);

        assert.deepStrictEqual(chunks, [
            [1, 2],
            [3, 4],
            [5, 6],
        ]);
    });

    test('Returns partial final chunk when chunk size is not divisible', () => {
        const array = [1, 2, 3, 4, 5];

        const chunks = chunkArray(array, 2);

        assert.deepStrictEqual(chunks, [[1, 2], [3, 4], [5]]);
    });
});
