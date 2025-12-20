import type { ReadWriteRepository } from './base/index.ts';

export interface TicketTypeSelectObject {
    id: number;
    guildId: string;
    emoji: string;
    name: string;
    description: string | null;
    channelId: string;
}

export interface TicketTypeInsertObject {
    guildId: string;
    emoji: string;
    name: string;
    channelId: string;
    description?: string | null | undefined;
}

export interface TicketTypesRepository
    extends ReadWriteRepository<
        TicketTypeSelectObject,
        TicketTypeInsertObject,
        'id'
    > {}
