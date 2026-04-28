# Checklist de Deploy no Render (Front + Back)

## 1) Backend (Web Service)
- **Root Directory**: `back`
- **Build Command**: `npm ci`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Node Version**: `18+` (recomendado)

### Variáveis obrigatórias do backend
- `NODE_ENV=production`
- `PORT` (Render injeta automaticamente)
- `DB_MAIN_HOST`
- `DB_MAIN_PORT`
- `DB_MAIN_USER`
- `DB_MAIN_PASSWORD`
- `DB_MAIN_NAME`

### Variáveis opcionais do backup
- `DB_BACKUP_HOST`
- `DB_BACKUP_PORT`
- `DB_BACKUP_USER`
- `DB_BACKUP_PASSWORD`
- `DB_BACKUP_NAME`

> O sistema sobe mesmo sem banco backup, mas **não** sobe sem o banco principal.

## 2) Frontend (Static Site)
- **Root Directory**: `front`
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `build`

### Variável recomendada no frontend
- `REACT_APP_API_URL=https://SEU_BACKEND.onrender.com/api`

Se essa variável não for definida, o frontend usa `/api` (mesmo domínio).

## 3) Conectividade entre máquinas
Para funcionar em várias máquinas, **nunca** use IP local (`192.168.x.x`) na URL da API em produção.
Use sempre:
- URL pública HTTPS do backend no Render (`https://...onrender.com/api`), ou
- Rota relativa `/api` quando front e API estiverem no mesmo domínio.

## 4) Verificação rápida pós deploy
1. Abrir: `https://SEU_BACKEND.onrender.com/health`
2. Confirmar resposta JSON com `status: healthy`
3. Abrir frontend em aba anônima
4. Fazer login e testar uma listagem (máquinas/monitores)
5. Repetir em outra máquina/rede
