# Estabilizacao mobile chamados e OCR

Data: 2026-05-04

## Contexto

O sistema esta em uso e apresenta inconsistencias que obrigam correcao manual no banco. Nem todas as telas tem CRUD completo, a pesquisa e simples e falha em alguns casos, a responsividade no celular esta ruim, e alteracoes recentes podem zerar o banco e causar perda de dados.

## Decisoes

- Trabalhar em uma branch separada antes de qualquer merge na main: `codex/estabilizacao-mobile-chamados-ocr`.
- Priorizar estabilidade sem quebrar o uso atual do sistema.
- Completar e ajustar CRUDs existentes onde necessario.
- Melhorar pesquisa para ser mais tolerante e confiavel.
- Deixar as telas principais 100% responsivas para celular, porque o registro por computador atrapalha a rotina de escanear devolucoes.
- Criar uma forma de subir a imagem da etiqueta de devolucao e tentar registrar automaticamente os dados identificados.
- Se a foto nao permitir identificar o nome do cliente, o usuario deve conseguir preencher o formulario manualmente.
- Manter o fluxo de registro de maquinas.
- SKU de configuracao continua fixo; somente ADM pode alterar ou criar novos SKUs de configuracao.
- Antes de registrar a maquina, deve ser informado o defeito identificado.
- Manter botao para reimprimir etiqueta.
- O tamanho da etiqueta nao pode mudar.
- A tela de kit nao e mais necessaria, porque KIT fica junto com maquinas.
- Reformular chamados para atender melhor o uso real do SAC.
- Chamados de SAC devem focar principalmente em "ficar de olho" em uma devolucao especifica de cliente e em agendamento de acesso remoto.
- Para "ficar de olho", o SAC informa nome do cliente, o que deve chegar e data prevista.
- Ao registrar uma devolucao, o sistema deve verificar se existe chamado aberto para o cliente.
- Se houver chamado aberto relacionado, o sistema deve fechar o chamado e avisar o SAC.
- Avisos devem ser feitos por e-mail quando isso ajudar o fluxo.
- Acesso remoto deve gerar aviso por e-mail para quem precisa atender o evento.
- Alteracoes no sistema nao devem zerar o banco nem apagar dados existentes.

## Relacionamentos

- Projeto: [[../Projeto Devolucao System]]

## Decisoes tecnicas aplicadas

- A leitura da etiqueta sera uma tentativa assistida por OCR local no backend usando `tesseract.js`.
- A leitura da etiqueta nao bloqueia o cadastro: quando o OCR nao identificar cliente com seguranca, o formulario continua manual.
- O upload de imagem de devolucao aceita fotos maiores de celular, ate 12MB.
- Avisos por e-mail usam SMTP opcional. Se SMTP nao estiver configurado, o chamado/devolucao continua funcionando e o backend apenas registra o aviso no log.
- Chamados passam a ter tipos principais: `acompanhar_devolucao`, `acesso_remoto` e `divergencia`.
- Chamados de acompanhamento sao fechados automaticamente quando uma devolucao compativel com o cliente/item esperado e registrada.
- A tela de Kit fica fora da navegacao; a rota antiga `/kit` redireciona para maquinas para nao quebrar links antigos.
- As rotas/backend de Kit foram mantidas por compatibilidade e para nao apagar historico.
- A inicializacao de banco ficou idempotente: cria/ajusta tabelas e colunas faltantes, mas nao executa `DROP` nem limpa dados.
- O tamanho das etiquetas ficou centralizado no frontend em 100mm x 30mm para reduzir risco de alteracao acidental.
- A tela de maquinas carrega a lista completa de SKUs/configuracoes no cadastro, porque os tecnicos nao sabem todos os codigos de cabeca.
- A area ADM de SKUs/configuracoes nao carrega todos os itens automaticamente; o ADM pesquisa o SKU que quer editar para evitar lentidao.
- A dashboard passa a ter relatorio flexivel de maquinas com dia especifico, semana atual, semana passada, ultimos 7 dias, filtro por SKU/configuracao, filtro por defeito e exportacao por soma, SKU, defeito ou detalhado.
- A preparacao para VPS usa `REACT_APP_API_URL` no frontend, `.env.example` para backend/frontend, PM2 para API e Nginx para servir build + proxy `/api`.
- A hospedagem em nuvem sera separada: frontend React na Vercel e API Express no Render.
- A Vercel deve apontar `REACT_APP_API_URL` para a URL publica da API no Render.
- O Render deve usar `CORS_ORIGINS` com o dominio da Vercel para liberar chamadas do frontend.
- Uploads de etiquetas no Render devem usar disco persistente via `UPLOAD_ROOT=/var/data/uploads`, evitando perda de imagens em redeploy/restart.
- O banco backup fica opcional na hospedagem Render; sem `DB_BACKUP_HOST`, o sistema usa apenas o banco principal externo.
