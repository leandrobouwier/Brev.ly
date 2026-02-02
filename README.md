# ✂️ Brev.ly - Encurtador de URLs

Projeto Full Stack desenvolvido como parte do desafio de pós-graduação da Rocketseat. O objetivo é criar uma aplicação completa para encurtamento de links, com gestão de acessos e relatórios.

## 🚀 Tecnologias

Esse projeto foi desenvolvido com a seguinte stack (T3 Stack / Modern Web):

- **Backend:** Node.js, Fastify, TypeScript, Drizzle ORM, Zod, PostgreSQL.
- **Frontend:** React, Vite, TailwindCSS, Tanstack Query.
- **Infra:** Docker (Banco de dados), Cloudflare R2 (Armazenamento de Relatórios).

## 📋 Checklist de Funcionalidades

### Backend (API)

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com URL encurtada mal formatada
- [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL’s cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
- [x] Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc)
- [x] Deve ser gerado um nome aleatório e único para o arquivo
- [x] Deve ser possível realizar a listagem de forma performática
- [x] O CSV deve ter campos como: URL original, URL encurtada, contagem de acessos e data de criação.

### Frontend (Web)

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com encurtamento mal formatado
- [x] Não deve ser possível criar um link com encurtamento já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio do encurtamento
- [x] Deve ser possível listar todas as URL’s cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível baixar um CSV com o relatório dos links criados
- [x] É obrigatória a criação de uma aplicação React no formato SPA utilizando o Vite como bundler
- [x] Siga o mais fielmente possível o layout do Figma
- [x] Trabalhe com elementos que tragam uma boa experiência ao usuário (empty state, ícones de carregamento, bloqueio de ações a depender do estado da aplicação)
- [x] Foco na responsividade: essa aplicação deve ter um bom uso tanto em desktops quanto em celulares

## 💻 Como rodar o projeto

### Pré-requisitos

- Node.js (v20+)
- Docker e Docker Compose
- PNPM (Recomendado)

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/leandrobouwier/Brev.ly
   cd brevly