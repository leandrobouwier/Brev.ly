import fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { db } from './db';
import { links } from './db/schema';
import { generateShortCode } from './lib/random'; 
import { desc, eq } from 'drizzle-orm';

import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from './lib/storage';
import { randomUUID } from 'node:crypto';

const app = fastify();

app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

    } catch (err: any) {

        if (err.code === '23505' || err.cause?.code === '23505') {
            return reply.status(400).send({
                message: 'Essa URL encurtada já existe'
            });
        }
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
        .set({ clicks: (link.clicks || 0) + 1 }) 
        .where(eq(links.id, link.id));

    return reply.redirect(link.originalUrl);
});

// Rota: LISTAR LINKS
app.get('/links', async () => {
    const result = await db
        .select()
        .from(links)
        .orderBy(desc(links.createdAt)); 

    return result;
});

// Rota: DELETAR LINK
app.delete('/links/:id', async (request, reply) => {
    const deleteLinkSchema = z.object({
        id: z.string().transform((v) => Number(v)), 
    });

    const { id } = deleteLinkSchema.parse(request.params);

    const result = await db.delete(links).where(eq(links.id, id)).returning();

    if (result.length === 0) {
        return reply.status(404).send({ message: 'Link não encontrado.' });
    }

    return reply.status(204).send();
});

app.get('/metrics', async (request, reply) => {
    const result = await db
        .select()
        .from(links)
        .orderBy(desc(links.createdAt));

    const csvHeaders = 'id;code;original_url;clicks;created_at';
    const csvRows = result.map(item => {
        return `${item.id};${item.code};${item.originalUrl};${item.clicks};${item.createdAt}`;
    });

    const csvContent = '\uFEFF' + [csvHeaders, ...csvRows].join('\n');
    const fileKey = `relatorio-${randomUUID()}.csv`;

    // Upload para o S3
    await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: csvContent,
        ContentType: 'text/csv',
    }));

    // Gerar link de download temporário (Presigned URL)
    const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        }),
        { expiresIn: 600 } 
    );
    
    return reply.send({
        fileUrl: downloadUrl,
    });
});

const port = Number(process.env.PORT) || 3333;

app.listen({
    port,
    host: '0.0.0.0'
}).then(() => {
    console.log(`🔥 Servidor rodando em http://localhost:${port}`);
});