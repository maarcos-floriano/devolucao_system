# Deploy em VPS

Guia para publicar o Devolucao System em uma VPS com Node.js, PM2, Nginx e MySQL/Aiven.

## 1. Preparar ambiente

Instale na VPS:

```bash
sudo apt update
sudo apt install -y nodejs npm nginx
sudo npm install -g pm2
```

Use Node 18 ou superior.

## 2. Subir arquivos

Clone o projeto na VPS:

```bash
git clone <url-do-repositorio> /var/www/devolucao_system
cd /var/www/devolucao_system
```

## 3. Backend

```bash
cd /var/www/devolucao_system/back
cp .env.example .env
nano .env
npm ci --omit=dev
npm run init-db
```

Preencha `.env` com banco, SMTP e porta. O `init-db` apenas cria/ajusta tabelas e colunas faltantes; ele nao apaga dados.

As imagens de etiquetas ficam em `back/public/uploads/devolucoes`. Em VPS, mantenha essa pasta em disco persistente e inclua no backup.

Inicie com PM2:

```bash
cd /var/www/devolucao_system
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Frontend

```bash
cd /var/www/devolucao_system/front
cp .env.example .env
nano .env
npm ci
npm run build
```

No `.env`, use:

```env
REACT_APP_API_URL=https://seudominio.com/api
```

## 5. Nginx

Exemplo de site:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    root /var/www/devolucao_system/front/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Ative:

```bash
sudo nano /etc/nginx/sites-available/devolucao_system
sudo ln -s /etc/nginx/sites-available/devolucao_system /etc/nginx/sites-enabled/devolucao_system
sudo nginx -t
sudo systemctl reload nginx
```

## 6. HTTPS

Com dominio apontado para a VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

## 7. Atualizar depois

```bash
cd /var/www/devolucao_system
git pull
cd back && npm ci --omit=dev && npm run init-db
cd ../front && npm ci && npm run build
pm2 restart devolucao-system-api
sudo systemctl reload nginx
```
