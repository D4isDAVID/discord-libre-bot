import type { ReadonlyRepository } from '../../repositories/index.ts';

export class MockReadonlyRepository<
    SelectObject,
    IdColumn extends keyof SelectObject,
> implements ReadonlyRepository<SelectObject, IdColumn>
{
    readonly cache = new Map<SelectObject[IdColumn], SelectObject>();

    // biome-ignore lint/suspicious/useAwait: mock promise
    async getAll(): Promise<SelectObject[]> {
        return [...this.cache.values()];
    }

    // biome-ignore lint/suspicious/useAwait: mock promise
    async findById(
        id: SelectObject[IdColumn],
    ): Promise<SelectObject | undefined> {
        return this.cache.get(id);
    }
}
