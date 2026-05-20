import type { RepositoryFindManyOptions } from './repository.ts';

export interface UserBasedRepository<
    ReadObject,
    UserIdProp extends keyof ReadObject,
> {
    findByUserId(
        userId: ReadObject[UserIdProp],
        options?: RepositoryFindManyOptions,
    ): Promise<ReadObject[]>;
}
