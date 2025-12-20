import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { MockReadWriteRepository } from './readwrite.ts';

interface MockObject {
    id: number;
    example: string;
}

suite('MockReadWriteRepository', () => {
    const repository = new MockReadWriteRepository<
        MockObject,
        MockObject,
        'id'
    >({
        idColumn: 'id',
        create(object) {
            return object;
        },
    });

    beforeEach(() => {
        repository.cache.clear();
        repository.cache.set(1, { id: 1, example: 'first' });
        repository.cache.set(2, { id: 2, example: 'second' });
    });

    suite('create()', () => {
        test('Creates the given object in cache', async () => {
            const response = await repository.create({
                id: 3,
                example: 'third',
            });

            const findResponse = await repository.findById(3);

            assert.deepStrictEqual(response, findResponse);
            assert.deepStrictEqual(response, { id: 3, example: 'third' });
        });
    });

    suite('update()', () => {
        test('Updates the given object in cache by the given ID', async () => {
            const response = await repository.update(1, { example: 'updated' });

            const findUpdatedResponse = await repository.findById(1);

            assert.deepStrictEqual(response, findUpdatedResponse);
            assert.strictEqual(findUpdatedResponse?.example, 'updated');
        });
    });

    suite('delete()', () => {
        test('Deletes an object from cache by the given ID', async () => {
            const findResponse = await repository.findById(1);

            const response = await repository.delete(1);

            const findDeletedResponse = await repository.findById(1);

            assert.deepStrictEqual(response, findResponse);
            assert.strictEqual(findDeletedResponse, undefined);
        });
    });
});
