import type { GuildBasedRepository, Repository } from '../base/index.ts';

export const configTableName = 'configs';

export interface ConfigReadObject extends ConfigWriteObject {
    id: number;
}

export interface ConfigWriteObject {
    guildId: string | null;
    prefix: string | null;
    features: string[];
}

export interface ConfigRepository
    extends Repository<ConfigReadObject, ConfigWriteObject, 'id'>,
        GuildBasedRepository<ConfigReadObject, 'guildId'> {}
