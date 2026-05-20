import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {
    BaseDrizzleRepositories,
    type BaseDrizzleRepositoriesOptions,
} from './base.ts';

export interface DrizzleRepositoriesOptions
    extends Pick<BaseDrizzleRepositoriesOptions, 'logger'> {
    connection: string;
}

export class DrizzleRepositories extends BaseDrizzleRepositories {
    constructor({ logger, connection }: DrizzleRepositoriesOptions) {
        super({
            logger,
            drizzle(config) {
                return drizzle(connection, config);
            },
            migrate,
        });
    }
}
