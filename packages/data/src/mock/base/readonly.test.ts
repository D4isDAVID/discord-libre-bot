import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { MockReadonlyRepository } from './readonly.ts';

interface MockObject {
    id: number;
    example: string;
}

suite('MockReadonlyRepository', () => {
    const repository = new MockReadonlyRepository<MockObject, 'id'>();

    beforeEach(() => {
        repository.cache.clear();
        repository.cache.set(1, { id: 1, example: 'first' });
        repository.cache.set(2, { id: 2, example: 'second' });
    });

    suite('getAll()', () => {
        test('Returns all objects in cache', async () => {
            const response = await repository.getAll();

            assert.deepStrictEqual(response, [
                { id: 1, example: 'first' },
                { id: 2, example: 'second' },
            ]);
        });
    });

    suite('findById()', () => {
        test('Returns the object in cache by the given ID', async () => {
            const response = await repository.findById(2);

            assert.deepStrictEqual(response, { id: 2, example: 'second' });
        });
    });
});
