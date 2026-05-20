/** biome-ignore-all lint/suspicious/useAwait: mock promise */

import type {
    GuildBasedRepository,
    Repository,
    RepositoryFindManyOptions,
    UserBasedRepository,
} from '../interfaces/index.ts';

export interface MockRepositoryOptions<
    ReadObject,
    WriteObject,
    IdProp extends keyof ReadObject,
    GuildIdProp extends keyof ReadObject | undefined = undefined,
    UserIdProp extends keyof ReadObject | undefined = undefined,
> {
    idProp: IdProp;
    guildIdProp: GuildIdProp;
    userIdProp: UserIdProp;
    write(object: WriteObject): ReadObject;
    data?: Map<ReadObject[IdProp], ReadObject> | undefined;
}

export class MockRepository<
    ReadObject,
    WriteObject,
    IdProp extends keyof ReadObject,
    GuildIdProp extends keyof ReadObject | undefined = undefined,
    UserIdProp extends keyof ReadObject | undefined = undefined,
> implements
        Repository<ReadObject, WriteObject, IdProp>,
        GuildBasedRepository<
            ReadObject,
            GuildIdProp extends undefined ? never : GuildIdProp
        >,
        UserBasedRepository<
            ReadObject,
            UserIdProp extends undefined ? never : UserIdProp
        >
{
    readonly #idProp: IdProp;
    readonly #guildIdProp: GuildIdProp;
    readonly #userIdProp: UserIdProp;
    readonly #write: (object: WriteObject) => ReadObject;
    readonly data: Map<ReadObject[IdProp], ReadObject>;

    constructor({
        idProp,
        guildIdProp,
        userIdProp,
        write,
        data,
    }: MockRepositoryOptions<
        ReadObject,
        WriteObject,
        IdProp,
        GuildIdProp,
        UserIdProp
    >) {
        this.#idProp = idProp;
        this.#guildIdProp = guildIdProp;
        this.#userIdProp = userIdProp;
        this.#write = write;
        this.data = data ?? new Map();
    }

    async count(): Promise<number> {
        return this.data.values().toArray().length;
    }

    async findMany({
        limit = Number.POSITIVE_INFINITY,
        offset = 0,
    }: RepositoryFindManyOptions = {}): Promise<ReadObject[]> {
        return this.data.values().drop(offset).take(limit).toArray();
    }

    async findById(id: ReadObject[IdProp]): Promise<ReadObject | undefined> {
        return this.data.get(id);
    }

    async create(object: WriteObject): Promise<ReadObject> {
        const createdObject = this.#write(object);

        this.data.set(createdObject[this.#idProp], createdObject);

        return createdObject;
    }

    async update(
        id: ReadObject[IdProp],
        object: Partial<WriteObject>,
    ): Promise<ReadObject | undefined> {
        const existingObject = this.data.get(id);

        if (typeof existingObject === 'undefined') {
            return;
        }

        const updatedObject = {
            ...existingObject,
            ...object,
        };

        this.data.set(id, updatedObject);

        return updatedObject;
    }

    async delete(id: ReadObject[IdProp]): Promise<ReadObject | undefined> {
        const existingObject = this.data.get(id);

        if (typeof existingObject === 'undefined') {
            return;
        }

        this.data.delete(id);

        return existingObject;
    }

    async findByGuildId(
        guildId: ReadObject[GuildIdProp extends undefined
            ? never
            : GuildIdProp],
        {
            limit = Number.POSITIVE_INFINITY,
            offset = 0,
        }: RepositoryFindManyOptions = {},
    ): Promise<ReadObject[]> {
        return this.data
            .values()
            .filter(
                (obj) => obj[this.#guildIdProp as keyof ReadObject] === guildId,
            )
            .drop(offset)
            .take(limit)
            .toArray();
    }

    async findByUserId(
        userId: ReadObject[UserIdProp extends undefined ? never : UserIdProp],
        {
            limit = Number.POSITIVE_INFINITY,
            offset = 0,
        }: RepositoryFindManyOptions = {},
    ): Promise<ReadObject[]> {
        return this.data
            .values()
            .filter(
                (obj) => obj[this.#userIdProp as keyof ReadObject] === userId,
            )
            .drop(offset)
            .take(limit)
            .toArray();
    }
}
