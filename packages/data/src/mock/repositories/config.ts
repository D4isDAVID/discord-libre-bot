import {
    type ConfigReadObject,
    type ConfigRepository,
    type ConfigWriteObject,
    configTableName,
} from '../../interfaces/repositories/config.ts';
import { autoIncrement } from '../autoincrement.ts';
import { MockRepository, type MockRepositoryOptions } from '../base.ts';

export interface MockConfigRepositoryOptions
    extends Pick<
        MockRepositoryOptions<
            ConfigReadObject,
            ConfigWriteObject,
            'id',
            'guildId'
        >,
        'data'
    > {}

export class MockConfigRepository
    extends MockRepository<ConfigReadObject, ConfigWriteObject, 'id', 'guildId'>
    implements ConfigRepository
{
    constructor({ data }: MockConfigRepositoryOptions = {}) {
        super({
            idProp: 'id',
            guildIdProp: 'guildId',
            userIdProp: undefined,
            write(object) {
                return {
                    ...object,
                    id: autoIncrement(configTableName),
                };
            },
            data,
        });
    }
}
