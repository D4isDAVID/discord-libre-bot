import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { configTableName } from '../../interfaces/repositories/config.ts';

export const configTable = pgTable(
    configTableName,
    {
        id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
        guildId: text().unique(),
        prefix: text(),
        features: text().array().notNull(),
    },
    (table) => [index().on(table.guildId)],
);
