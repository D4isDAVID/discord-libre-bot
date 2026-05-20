import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { MockRepository } from './base.ts';

interface MockObject {
    id: number;
    guildId: string;
    userId: string;
    foo: string;
}

const objects = [
    {
        id: 1,
        guildId: '123',
        userId: '123',
        foo: 'bar',
    },
    {
        id: 2,
        guildId: '123',
        userId: '456',
        foo: 'baz',
    },
    {
        id: 3,
        guildId: '456',
        userId: '456',
        foo: 'bar',
    },
    {
        id: 4,
        guildId: '456',
        userId: '123',
        foo: 'baz',
    },
] as const;

suite('MockRepository', () => {
    const repository = new MockRepository({
        idProp: 'id',
        guildIdProp: 'guildId',
        userIdProp: 'userId',
        write(object: MockObject): MockObject {
            return object;
        },
    });

    beforeEach(() => {
        repository.data.clear();

        for (const object of objects) {
            repository.data.set(object.id, object);
        }
    });

    suite('count()', () => {
        test('Returns object count', async () => {
            const count = await repository.count();

            assert.strictEqual(count, 4);
        });
    });

    suite('findMany()', () => {
        test('Returns all objects', async () => {
            const response = await repository.findMany();

            assert.deepStrictEqual(response, objects);
        });

        test('Returns one object', async () => {
            const response = await repository.findMany({ limit: 1, offset: 0 });

            assert.deepStrictEqual(response, [objects[0]]);
        });

        test('Returns one object and skips one object', async () => {
            const response = await repository.findMany({ limit: 1, offset: 1 });

            assert.deepStrictEqual(response, [objects[1]]);
        });
    });

    suite('findById()', () => {
        test('Returns object by the given ID', async () => {
            const response = await repository.findById(1);

            assert.deepStrictEqual(response, objects[0]);
        });
    });

    suite('findByGuildId()', () => {
        test('Returns all objects by the given Guild ID', async () => {
            const response = await repository.findByGuildId('123');

            assert.deepStrictEqual(response, [objects[0], objects[1]]);
        });

        test('Returns one object', async () => {
            const response = await repository.findByGuildId('123', {
                limit: 1,
                offset: 0,
            });

            assert.deepStrictEqual(response, [objects[0]]);
        });

        test('Returns one object and skips one object', async () => {
            const response = await repository.findByGuildId('123', {
                limit: 1,
                offset: 1,
            });

            assert.deepStrictEqual(response, [objects[1]]);
        });
    });

    suite('findByUserId()', () => {
        test('Returns all objects by the given User ID', async () => {
            const response = await repository.findByUserId('123');

            assert.deepStrictEqual(response, [objects[0], objects[3]]);
        });

        test('Returns one object', async () => {
            const response = await repository.findByUserId('123', {
                limit: 1,
                offset: 0,
            });

            assert.deepStrictEqual(response, [objects[0]]);
        });

        test('Returns one object and skips one object', async () => {
            const response = await repository.findByUserId('123', {
                limit: 1,
                offset: 1,
            });

            assert.deepStrictEqual(response, [objects[3]]);
        });
    });
});
