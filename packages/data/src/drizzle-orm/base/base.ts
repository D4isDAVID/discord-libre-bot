import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type {
    PgDatabase,
    PgQueryResultHKT,
    PgTable,
    TableConfig,
} from 'drizzle-orm/pg-core';
import type { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query';

export interface DrizzleRepositoryOptions<
    Schema extends Record<string, unknown>,
    Database extends PgDatabase<PgQueryResultHKT, Schema>,
    Config extends TableConfig,
    Table extends PgTable<Config>,
    QueryBuilderTable extends keyof ExtractTablesWithRelations<Schema>,
> {
    db: Database;
    table: Table;
    query: RelationalQueryBuilder<
        ExtractTablesWithRelations<Schema>,
        ExtractTablesWithRelations<Schema>[QueryBuilderTable]
    >;
}

export class DrizzleRepository<
    Schema extends Record<string, unknown>,
    Database extends PgDatabase<PgQueryResultHKT, Schema>,
    Config extends TableConfig,
    Table extends PgTable<Config>,
    QueryBuilderTable extends keyof ExtractTablesWithRelations<Schema>,
> {
    readonly db: Database;
    readonly table: Table;
    readonly query: RelationalQueryBuilder<
        ExtractTablesWithRelations<Schema>,
        ExtractTablesWithRelations<Schema>[QueryBuilderTable]
    >;

    constructor({
        db,
        table,
        query,
    }: DrizzleRepositoryOptions<
        Schema,
        Database,
        Config,
        Table,
        QueryBuilderTable
    >) {
        this.db = db;
        this.table = table;
        this.query = query;
    }
}
