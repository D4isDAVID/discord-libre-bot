import { getTableColumns } from 'drizzle-orm';
import type { StatusRepository } from '../../interfaces/repositories/status.ts';
import { DrizzleRepository, type DrizzleRepositoryOptions } from '../base.ts';
// biome-ignore lint/performance/noNamespaceImport: we need the full schema
import * as schema from '../schema/index.ts';

export interface DrizzleStatusRepositoryOptions
    extends Pick<
        DrizzleRepositoryOptions<typeof schema, typeof schema.statusTable>,
        'db' | 'query'
    > {}

export class DrizzleStatusRepository
    extends DrizzleRepository<typeof schema, typeof schema.statusTable, 'id'>
    implements StatusRepository
{
    constructor({ db, query }: DrizzleStatusRepositoryOptions) {
        const columns = getTableColumns(schema.statusTable);

        super({
            db,
            table: schema.statusTable,
            query,
            idColumn: columns.id,
            guildIdColumn: undefined,
            userIdColumn: undefined,
        });
    }
}
