import type { RepositoryFindManyOptions } from './repository.ts';

export interface ChannelBasedRepository<
    ReadObject,
    ChannelIdProp extends keyof ReadObject,
> {
    findByChannelId(
        channelId: ReadObject[ChannelIdProp],
        options?: RepositoryFindManyOptions,
    ): Promise<ReadObject[]>;
}
