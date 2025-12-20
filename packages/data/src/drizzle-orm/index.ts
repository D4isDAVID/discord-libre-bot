import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {
    BaseDrizzleRepositories,
    type BaseDrizzleRepositoriesOptions,
} from './base.ts';

interface DrizzleRepositoriesOptions
    extends Pick<BaseDrizzleRepositoriesOptions, 'logger'> {
    connection: string;
}

export class DrizzleRepositories extends BaseDrizzleRepositories {
    constructor({ connection, logger }: DrizzleRepositoriesOptions) {
        super({
            drizzle: (config) => drizzle(connection, config),
            migrate,
            logger,
        });
    }
}
