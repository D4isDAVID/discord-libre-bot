import { getTableColumns } from 'drizzle-orm';
import type { ConfigRepository } from '../../interfaces/repositories/config.ts';
import { DrizzleRepository, type DrizzleRepositoryOptions } from '../base.ts';
// biome-ignore lint/performance/noNamespaceImport: we need the full schema
import * as schema from '../schema/index.ts';

export interface DrizzleConfigRepositoryOptions
    extends Pick<
        DrizzleRepositoryOptions<
            typeof schema,
            typeof schema.configTable,
            'guildId'
        >,
        'db' | 'query'
    > {}

export class DrizzleConfigRepository
    extends DrizzleRepository<
        typeof schema,
        typeof schema.configTable,
        'id',
        'guildId'
    >
    implements ConfigRepository
{
    constructor({ db, query }: DrizzleConfigRepositoryOptions) {
        const columns = getTableColumns(schema.configTable);

        super({
            db,
            table: schema.configTable,
            query,
            idColumn: columns.id,
            guildIdColumn: columns.guildId,
            userIdColumn: undefined,
        });
    }
}
