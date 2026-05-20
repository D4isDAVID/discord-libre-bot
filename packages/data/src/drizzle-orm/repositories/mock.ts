import type { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import {
    BaseDrizzleRepositories,
    type BaseDrizzleRepositoriesOptions,
} from './base.ts';

export interface MockDrizzleRepositoriesOptions
    extends Pick<BaseDrizzleRepositoriesOptions, 'logger'> {
    client: PGlite;
}

export class MockDrizzleRepositories extends BaseDrizzleRepositories {
    constructor({ logger, client }: MockDrizzleRepositoriesOptions) {
        super({
            logger,
            drizzle(config) {
                return drizzle(client, config);
            },
            migrate,
        });
    }
}
