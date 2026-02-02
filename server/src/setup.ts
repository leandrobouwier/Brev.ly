// src/setup.ts
import { sql } from "./lib/postgress";

async function setup() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        console.log('✅ Tabela "links" criada com sucesso!')
    } catch (err) {
        console.error('❌ Erro ao criar tabela:', err)
    } finally {
        await sql.end()
    }
}

setup()