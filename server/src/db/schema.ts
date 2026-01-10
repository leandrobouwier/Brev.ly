import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
    id: serial('id').primaryKey(), // ID numérico para controle interno
    code: text('code').unique().notNull(), // O código encurtado (ex: "Xy9Az")
    originalUrl: text('original_url').notNull(),
    clicks: integer('clicks').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});