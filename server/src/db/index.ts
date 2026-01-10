import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Configura o driver do banco
const client = postgres(process.env.DATABASE_URL!);

// Exporta a conexão pronta para uso (com o schema tipado)
export const db = drizzle(client, { schema });