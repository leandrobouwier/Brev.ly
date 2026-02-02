import postgres from 'postgres'
import 'dotenv/config' // Para ler as variáveis do .env

export const sql = postgres(process.env.DATABASE_URL!)