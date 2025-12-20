import type { ReadWriteRepository } from '../../repositories/index.ts';
import { MockReadonlyRepository } from './readonly.ts';

export interface MockReadWriteRepositoryOptions<
    SelectObject,
    InsertObject,
    IdColumn extends keyof SelectObject,
> {
    create(object: InsertObject): SelectObject;
    idColumn: IdColumn;
}

export class MockReadWriteRepository<
        SelectObject,
        InsertObject,
        IdColumn extends keyof SelectObject,
    >
    extends MockReadonlyRepository<SelectObject, IdColumn>
    implements ReadWriteRepository<SelectObject, InsertObject, IdColumn>
{
    readonly #create: (object: InsertObject) => SelectObject;
    readonly #idColumn: IdColumn;

    constructor({
        idColumn,
        create,
    }: MockReadWriteRepositoryOptions<SelectObject, InsertObject, IdColumn>) {
        super();

        this.#create = create;
        this.#idColumn = idColumn;
    }

    // biome-ignore lint/suspicious/useAwait: mock promise
    async create(object: InsertObject): Promise<SelectObject> {
        const createdObject = this.#create(object);

        this.cache.set(createdObject[this.#idColumn], createdObject);

        return createdObject;
    }

    // biome-ignore lint/suspicious/useAwait: mock promise
    async update(
        id: SelectObject[IdColumn],
        object: Partial<InsertObject>,
    ): Promise<SelectObject | undefined> {
        const existingObject = this.cache.get(id);

        if (typeof existingObject === 'undefined') {
            return;
        }

        const updatedObject = {
            ...existingObject,
            ...object,
        };

        this.cache.set(id, updatedObject);

        return updatedObject;
    }

    // biome-ignore lint/suspicious/useAwait: mock promise
    async delete(
        id: SelectObject[IdColumn],
    ): Promise<SelectObject | undefined> {
        const existingObject = this.cache.get(id);

        if (typeof existingObject === 'undefined') {
            return;
        }

        this.cache.delete(id);

        return existingObject;
    }
}
