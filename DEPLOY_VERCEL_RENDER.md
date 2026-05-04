# Deploy na Vercel e Render

Este guia publica o frontend na Vercel e a API no Render.

Referencias oficiais:

- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel `vercel.json`: https://vercel.com/docs/project-configuration/vercel-json
- Vercel variaveis de ambiente: https://vercel.com/docs/projects/environment-variables
- Render Node/Express: https://render.com/docs/deploy-node-express-app
- Render web services e porta: https://render.com/docs/web-services#port-binding
- Render Blueprint: https://render.com/docs/blueprint-spec

## Arquitetura

- Vercel: hospeda o React em `front`.
- Render: hospeda a API Express em `back`.
- Banco: continua externo, usando as variaveis `DB_MAIN_*`.
- Uploads de etiquetas: ficam no disco persistente do Render, em `/var/data/uploads`.

## 1. Subir a API no Render

Opcao recomendada: Blueprint.

1. Envie esta branch para o GitHub.
2. No Render, crie um Blueprint apontando para este repositorio.
3. O Render vai ler o arquivo `render.yaml`.
4. Preencha as variaveis marcadas como secret no fluxo inicial.

Variaveis obrigatorias da API:

```env
DB_MAIN_HOST=seu-host-mysql
DB_MAIN_PORT=3306
DB_MAIN_USER=usuario
DB_MAIN_PASSWORD=senha
DB_MAIN_NAME=rma
CORS_ORIGINS=https://seu-front.vercel.app
```

Variaveis recomendadas/opcionais:

```env
OCR_LANGS=por+eng
UPLOAD_ROOT=/var/data/uploads
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario@seudominio.com
SMTP_PASS=senha
MAIL_FROM=RMA <usuario@seudominio.com>
SAC_NOTIFICATION_EMAIL=sac@seudominio.com
REMOTE_ACCESS_NOTIFICATION_EMAIL=seuemail@seudominio.com
ADMIN_NOTIFICATION_EMAIL=seuemail@seudominio.com
```

Se usar mais de um dominio de frontend, separe no `CORS_ORIGINS` por virgula:

```env
CORS_ORIGINS=https://seu-front.vercel.app,https://seudominio.com
```

Depois do deploy, teste:

```text
https://devolucao-system-api.onrender.com/health
```

O retorno esperado e `status: healthy`.

## 2. Subir o frontend na Vercel

Opcao recomendada no painel da Vercel:

1. Importar o mesmo repositorio.
2. Em Root Directory, escolher `front`.
3. Framework Preset: Create React App.
4. Build Command: `npm run build`.
5. Output Directory: `build`.

Variavel obrigatoria na Vercel:

```env
REACT_APP_API_URL=https://devolucao-system-api.onrender.com/api
```

Depois que a API tiver URL definitiva, ajuste essa variavel e redeploye o frontend. Em Create React App, variaveis `REACT_APP_*` entram no build; alterar a variavel sem redeploy nao atualiza o site publicado.

## 3. Ordem correta do primeiro deploy

1. Deploy da API no Render.
2. Testar `/health`.
3. Copiar a URL da API.
4. Configurar `REACT_APP_API_URL` na Vercel.
5. Deploy do frontend.
6. Voltar no Render e ajustar `CORS_ORIGINS` com a URL real da Vercel.
7. Redeploy da API se o Render nao aplicar a variavel automaticamente.

## 4. Observacoes importantes

- O backend usa `PORT` do Render automaticamente; nao configure porta fixa no painel.
- O banco backup e opcional. No Render, deixe `DB_BACKUP_*` vazio se nao houver backup externo.
- O `initTables` continua idempotente: cria/ajusta schema, mas nao apaga dados.
- O disco persistente do Render guarda as imagens de etiquetas; sem disco persistente, uploads podem sumir em redeploy/restart.
- Se o banco externo bloquear conexoes por IP, libere o acesso do Render conforme a configuracao do seu provedor de banco.
- A rota `/uploads/...` e servida pela API do Render, entao imagens salvas podem ser acessadas pelo dominio da API.

## 5. Deploy manual sem Blueprint

Render Web Service:

```text
Root Directory: back
Runtime: Node
Build Command: npm ci --omit=dev
Start Command: npm start
Health Check Path: /health
```

Vercel:

```text
Root Directory: front
Build Command: npm run build
Output Directory: build
Environment: REACT_APP_API_URL=https://sua-api.onrender.com/api
```
