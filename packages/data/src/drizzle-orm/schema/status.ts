import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { statusTableName } from '../../interfaces/repositories/status.ts';

export const statusTable = pgTable(statusTableName, {
    id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
    status: text().notNull(),
    afk: boolean().notNull(),
    activityType: integer().notNull(),
    activityName: text().notNull(),
    activityState: text(),
    activityUrl: text(),
});
