import {
    type Column,
    type ExtractTablesWithRelations,
    eq,
    getTableColumns,
} from 'drizzle-orm';
import type {
    PgDatabase,
    PgQueryResultHKT,
    PgTable,
    TableConfig,
} from 'drizzle-orm/pg-core';
import type { ReadonlyRepository } from '../../repositories/index.ts';
import { DrizzleRepository, type DrizzleRepositoryOptions } from './base.ts';

export interface DrizzleReadonlyRepositoryOptions<
    Schema extends Record<string, unknown>,
    Database extends PgDatabase<PgQueryResultHKT, Schema>,
    Config extends TableConfig,
    Table extends PgTable<Config>,
    QueryBuilderTable extends keyof ExtractTablesWithRelations<Schema>,
    IdColumn extends keyof Config['columns'] & keyof Table['$inferSelect'],
> extends DrizzleRepositoryOptions<
        Schema,
        Database,
        Config,
        Table,
        QueryBuilderTable
    > {
    idColumn: IdColumn;
}

export class DrizzleReadonlyRepository<
        Schema extends Record<string, unknown>,
        Database extends PgDatabase<PgQueryResultHKT, Schema>,
        Config extends TableConfig,
        Table extends PgTable<Config>,
        QueryBuilderTable extends keyof ExtractTablesWithRelations<Schema>,
        IdColumn extends keyof Config['columns'] & keyof Table['$inferSelect'],
    >
    extends DrizzleRepository<
        Schema,
        Database,
        Config,
        Table,
        QueryBuilderTable
    >
    implements ReadonlyRepository<Table['$inferSelect'], IdColumn>
{
    readonly idColumn: Column;

    constructor({
        db,
        table,
        query,
        idColumn,
    }: DrizzleReadonlyRepositoryOptions<
        Schema,
        Database,
        Config,
        Table,
        QueryBuilderTable,
        IdColumn
    >) {
        super({ db, table, query });

        this.idColumn = getTableColumns(table)[idColumn] as Column;
    }

    async getAll(): Promise<Table['$inferSelect'][]> {
        const response = await this.query.findMany();

        return response as Table['$inferSelect'][];
    }

    async findById(
        id: Table['$inferSelect'][IdColumn],
    ): Promise<Table['$inferSelect'] | undefined> {
        const response = await this.query.findFirst({
            where: eq(this.idColumn, id),
        });

        return response;
    }
}
