import type {
    Repositories,
    TicketTypeInsertObject,
    TicketTypeSelectObject,
} from '../repositories/index.ts';
import { autoIncrement } from './autoincrement.ts';
import { MockReadWriteRepository } from './base/readwrite.ts';

export class MockRepositories implements Repositories {
    readonly ticketTypes = new MockReadWriteRepository({
        create: (object: TicketTypeInsertObject): TicketTypeSelectObject => ({
            ...object,
            id: autoIncrement('ticketTypes'),
            description: object.description ?? null,
        }),
        idColumn: 'id',
    });
}
