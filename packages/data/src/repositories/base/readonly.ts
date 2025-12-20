export interface ReadonlyRepository<
    SelectObject,
    IdColumn extends keyof SelectObject,
> {
    getAll(): Promise<SelectObject[]>;
    findById(id: SelectObject[IdColumn]): Promise<SelectObject | undefined>;
}
