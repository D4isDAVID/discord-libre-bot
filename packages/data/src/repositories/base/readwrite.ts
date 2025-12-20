import type { ReadonlyRepository } from './readonly.ts';

export interface ReadWriteRepository<
    SelectObject,
    InsertObject,
    IdColumn extends keyof SelectObject,
> extends ReadonlyRepository<SelectObject, IdColumn> {
    create(object: InsertObject): Promise<SelectObject>;
    update(
        id: SelectObject[IdColumn],
        object: Partial<InsertObject>,
    ): Promise<SelectObject | undefined>;
    delete(id: SelectObject[IdColumn]): Promise<SelectObject | undefined>;
}
