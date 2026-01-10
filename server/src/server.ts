import fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { db } from './db';
import { links } from './db/schema';
import { generateShortCode } from './lib/random'; // <--- Agora esse arquivo existe!
import { PostgresError } from 'postgres';
import { desc, eq } from 'drizzle-orm';

const app = fastify();

app.register(cors, {
    origin: '*',
});

// Rota: CRIAR LINK
app.post('/links', async (request, reply) => {
    const createLinkSchema = z.object({
        code: z.string().min(3).optional(),
        url: z.string().url(),
    });

    const { code, url } = createLinkSchema.parse(request.body);

    try {
        const linkCode = code || generateShortCode();

        const result = await db.insert(links).values({
            code: linkCode,
            originalUrl: url,
        }).returning();

        return reply.status(201).send(result[0]);

    } catch (err) {
        if (err instanceof PostgresError && err.code === '23505') {
            return reply.status(400).send({ message: 'Este código já está em uso.' });
        }
        console.error(err);
        return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
});

// Rota: REDIRECIONAR E CONTAR ACESSO
app.get('/:code', async (request, reply) => {
    const getLinkSchema = z.object({
        code: z.string().min(3),
    });

    const { code } = getLinkSchema.parse(request.params);

    const result = await db
        .select()
        .from(links)
        .where(eq(links.code, code));

    if (result.length === 0) {
        return reply.status(404).send({ message: 'Link não encontrado.' });
    }

    const link = result[0];

    await db.update(links)
        .set({ clicks: (link.clicks || 0) + 1 }) // Correção 1: Se for nulo, usa 0
        .where(eq(links.id, link.id));

    // Correção 2: Removemos o 302, ele é o padrão automático
    return reply.redirect(link.originalUrl);
});

// Rota: LISTAR LINKS
app.get('/links', async () => {
    const result = await db
        .select()
        .from(links)
        .orderBy(desc(links.createdAt)); // Agora o 'desc' vai funcionar porque importamos!

    return result;
});

// Rota: DELETAR LINK
app.delete('/links/:id', async (request, reply) => {
    const deleteLinkSchema = z.object({
        id: z.string().transform((v) => Number(v)), // Converte "12" (texto) para 12 (número)
    });

    const { id } = deleteLinkSchema.parse(request.params);

    // Deleta onde o ID for igual ao passado
    const result = await db.delete(links).where(eq(links.id, id)).returning();

    // Se não deletou nada (ID não existe), retorna 404
    if (result.length === 0) {
        return reply.status(404).send({ message: 'Link não encontrado.' });
    }

    // Retorna vazio com status 204 (No Content - Sucesso sem corpo)
    return reply.status(204).send();
});

// Rota: EXPORTAR CSV (Teste Local)
app.get('/metrics', async (request, reply) => {
    // 1. Busca todos os links
    const result = await db
        .select()
        .from(links)
        .orderBy(desc(links.createdAt));

    // 2. Cria o cabeçalho do CSV
    const csvHeaders = 'id,code,original_url,clicks,created_at';

    // 3. Transforma cada link em uma linha de texto separada por vírgula
    const csvRows = result.map(item => {
        return `${item.id},${item.code},${item.originalUrl},${item.clicks},${item.createdAt}`;
    });

    // 4. Junta tudo com quebras de linha (\n)
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // 5. Configura a resposta para o navegador entender que é um download
    return reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename="relatorio.csv"')
        .send(csvContent);
});

app.listen({ port: 3333 }).then(() => {
    console.log('🔥 Servidor rodando em http://localhost:3333');
});