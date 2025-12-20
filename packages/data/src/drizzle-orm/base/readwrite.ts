import { type ExtractTablesWithRelations, eq } from 'drizzle-orm';
import type {
    PgDatabase,
    PgInsertValue,
    PgQueryResultHKT,
    PgTable,
    TableConfig,
} from 'drizzle-orm/pg-core';
import type { ReadWriteRepository } from '../../repositories/index.ts';
import { DrizzleReadonlyRepository } from './readonly.ts';

export class DrizzleReadWriteRepository<
        Schema extends Record<string, unknown>,
        Database extends PgDatabase<PgQueryResultHKT, Schema>,
        Config extends TableConfig,
        Table extends PgTable<Config>,
        QueryBuilderTable extends keyof ExtractTablesWithRelations<Schema>,
        IdColumn extends keyof Config['columns'] & keyof Table['$inferSelect'],
    >
    extends DrizzleReadonlyRepository<
        Schema,
        Database,
        Config,
        Table,
        QueryBuilderTable,
        IdColumn
    >
    implements
        ReadWriteRepository<
            Table['$inferSelect'],
            Table['$inferInsert'],
            IdColumn
        >
{
    async create(
        object: Table['$inferInsert'],
    ): Promise<Table['$inferSelect']> {
        const response = await this.db
            .insert(this.table)
            .values(object as PgInsertValue<Table>)
            .returning();

        return (response as [Table['$inferSelect']])[0];
    }

    async update(
        id: Table['$inferSelect'][IdColumn],
        object: Partial<Table['$inferInsert']>,
    ): Promise<Table['$inferSelect'] | undefined> {
        const response = await this.db
            .update(this.table)
            .set(object)
            .where(eq(this.idColumn, id))
            .returning();

        return (response as Table['$inferSelect'][])[0];
    }

    async delete(
        id: Table['$inferSelect'][IdColumn],
    ): Promise<Table['$inferSelect'] | undefined> {
        const response = await this.db
            .delete(this.table)
            .where(eq(this.idColumn, id))
            .returning();

        return (response as [Table['$inferSelect']])[0];
    }
}
