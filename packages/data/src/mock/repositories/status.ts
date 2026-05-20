import {
    type StatusReadObject,
    type StatusRepository,
    type StatusWriteObject,
    statusTableName,
} from '../../interfaces/repositories/status.ts';
import { autoIncrement } from '../autoincrement.ts';
import { MockRepository, type MockRepositoryOptions } from '../base.ts';

export interface MockStatusRepositoryOptions
    extends Pick<
        MockRepositoryOptions<StatusReadObject, StatusWriteObject, 'id'>,
        'data'
    > {}

export class MockStatusRepository
    extends MockRepository<StatusReadObject, StatusWriteObject, 'id'>
    implements StatusRepository
{
    constructor({ data }: MockStatusRepositoryOptions = {}) {
        super({
            idProp: 'id',
            guildIdProp: undefined,
            userIdProp: undefined,
            write(object) {
                return {
                    ...object,
                    id: autoIncrement(statusTableName),
                };
            },
            data,
        });
    }
}
