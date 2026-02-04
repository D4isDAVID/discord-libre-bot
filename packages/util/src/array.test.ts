import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { chunkArray } from './array.ts';

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
