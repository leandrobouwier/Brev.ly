import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Isso carrega as variáveis do arquivo .env
dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Agora o 'process' deve ser reconhecido e a URL carregada
    url: process.env.DATABASE_URL!,
  },
});