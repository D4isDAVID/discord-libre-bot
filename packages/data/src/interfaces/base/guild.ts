import type { RepositoryFindManyOptions } from './repository.ts';

export interface GuildBasedRepository<
    ReadObject,
    GuildIdProp extends keyof ReadObject,
> {
    findByGuildId(
        guildId: ReadObject[GuildIdProp],
        options?: RepositoryFindManyOptions,
    ): Promise<ReadObject[]>;
}
