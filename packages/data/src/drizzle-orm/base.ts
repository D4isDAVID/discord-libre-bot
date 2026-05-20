import type { MapUnion } from '@internal/common';
import { type Column, type ExtractTablesWithRelations, eq } from 'drizzle-orm';
import type {
    PgDatabase,
    PgQueryResultHKT,
    PgTable,
    TableConfig,
} from 'drizzle-orm/pg-core';
import type { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query';
import type {
    GuildBasedRepository,
    Repository,
    RepositoryFindManyOptions,
    UserBasedRepository,
} from '../interfaces/index.ts';

export interface DrizzleRepositoryOptions<
    Schema extends Record<string, unknown>,
    Table extends PgTable<TableConfig>,
    GuildIdProp extends
        | (keyof Table['_']['config']['columns'] & keyof Table['$inferSelect'])
        | undefined = undefined,
    UserIdProp extends
        | (keyof Table['_']['config']['columns'] & keyof Table['$inferSelect'])
        | undefined = undefined,
> {
    db: PgDatabase<PgQueryResultHKT, Schema>;
    table: Table;
    query: RelationalQueryBuilder<
        ExtractTablesWithRelations<Schema>,
        MapUnion<ExtractTablesWithRelations<Schema>>
    >;
    idColumn: Column;
    guildIdColumn: GuildIdProp extends undefined ? undefined : Column;
    userIdColumn: UserIdProp extends undefined ? undefined : Column;
}

export class DrizzleRepository<
    Schema extends Record<string, unknown>,
    Table extends PgTable<TableConfig>,
    IdProp extends keyof Table['_']['config']['columns'] &
        keyof Table['$inferSelect'],
    GuildIdProp extends
        | (keyof Table['_']['config']['columns'] & keyof Table['$inferSelect'])
        | undefined = undefined,
    UserIdProp extends
        | (keyof Table['_']['config']['columns'] & keyof Table['$inferSelect'])
        | undefined = undefined,
> implements
        Repository<Table['$inferSelect'], Table['$inferInsert'], IdProp>,
        GuildBasedRepository<
            Table['$inferSelect'],
            GuildIdProp extends undefined ? never : GuildIdProp
        >,
        UserBasedRepository<
            Table['$inferSelect'],
            UserIdProp extends undefined ? never : UserIdProp
        >
{
    readonly db: PgDatabase<PgQueryResultHKT, Schema>;
    readonly table: Table;
    readonly query: RelationalQueryBuilder<
        ExtractTablesWithRelations<Schema>,
        MapUnion<ExtractTablesWithRelations<Schema>>
    >;

    readonly #idColumn: Column;
    readonly #guildIdColumn: GuildIdProp extends undefined ? undefined : Column;
    readonly #userIdColumn: UserIdProp extends undefined ? undefined : Column;

    constructor({
        db,
        table,
        query,
        idColumn,
        guildIdColumn,
        userIdColumn,
    }: DrizzleRepositoryOptions<Schema, Table, GuildIdProp, UserIdProp>) {
        this.db = db;
        this.table = table;
        this.query = query;
        this.#idColumn = idColumn;
        this.#guildIdColumn = guildIdColumn;
        this.#userIdColumn = userIdColumn;
    }

    async count(): Promise<number> {
        return await this.db.$count(this.table);
    }

    async findMany({
        limit,
        offset,
    }: RepositoryFindManyOptions = {}): Promise<Table['$inferSelect'][]> {
        return await this.query.findMany({
            limit,
            offset,
        });
    }

    async findById(
        id: Table['$inferSelect'][IdProp],
    ): Promise<Table['$inferSelect'] | undefined> {
        return await this.query.findFirst({
            where: eq(this.#idColumn, id),
        });
    }

    async create(
        object: Table['$inferInsert'],
    ): Promise<Table['$inferSelect']> {
        const response = (await this.db
            .insert(this.table)
            .values(object)
            .returning()) as [Table['$inferSelect']];

        return response[0];
    }

    async update(
        id: Table['$inferSelect'][IdProp],
        object: Partial<Table['$inferInsert']>,
    ): Promise<Table['$inferSelect'] | undefined> {
        const response = (await this.db
            .update(this.table)
            .set(object)
            .where(eq(this.#idColumn, id))
            .returning()) as [Table['$inferSelect']];

        return response[0];
    }

    async delete(
        id: Table['$inferSelect'][IdProp],
    ): Promise<Table['$inferSelect'] | undefined> {
        const response = (await this.db
            .delete(this.table)
            .where(eq(this.#idColumn, id))
            .returning()) as [Table['$inferSelect']];

        return response[0];
    }

    async findByGuildId(
        guildId: Table['$inferSelect'][GuildIdProp extends undefined
            ? never
            : GuildIdProp],
        { limit, offset }: RepositoryFindManyOptions = {},
    ): Promise<Table['$inferSelect'][]> {
        return await this.query.findMany({
            limit,
            offset,
            where: eq(this.#guildIdColumn as Column, guildId),
        });
    }

    async findByUserId(
        userId: Table['$inferSelect'][UserIdProp extends undefined
            ? never
            : UserIdProp],
        { limit, offset }: RepositoryFindManyOptions = {},
    ): Promise<Table['$inferSelect'][]> {
        return await this.query.findMany({
            limit,
            offset,
            where: eq(this.#userIdColumn as Column, userId),
        });
    }
}
