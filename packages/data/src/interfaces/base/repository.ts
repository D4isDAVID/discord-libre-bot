export interface RepositoryFindManyOptions {
    limit?: number | undefined;
    offset?: number | undefined;
}

export interface Repository<
    ReadObject,
    WriteObject,
    IdProp extends keyof ReadObject,
> {
    count(): Promise<number>;
    findMany(options?: RepositoryFindManyOptions): Promise<ReadObject[]>;
    findById(id: ReadObject[IdProp]): Promise<ReadObject | undefined>;

    create(object: WriteObject): Promise<ReadObject>;
    update(
        id: ReadObject[IdProp],
        object: Partial<WriteObject>,
    ): Promise<ReadObject | undefined>;
    delete(id: ReadObject[IdProp]): Promise<ReadObject | undefined>;
}
