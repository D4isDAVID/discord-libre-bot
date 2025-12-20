import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';

export const ticketTypesTable = pgTable(
    'ticket_types',
    {
        id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
        guildId: text().notNull(),
        emoji: text().notNull(),
        name: text().notNull(),
        description: text(),
        channelId: text().notNull(),
    },
    (table) => [index().on(table.guildId)],
);
