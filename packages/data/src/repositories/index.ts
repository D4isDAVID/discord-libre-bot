import type { TicketTypesRepository } from './tickets.ts';

export interface Repositories {
    readonly ticketTypes: TicketTypesRepository;
}

export * from './base/index.ts';
export * from './tickets.ts';
