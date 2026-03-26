const express = require('express');
const path = require('path');
const cors = require('cors');
const database = require('./config/database');
const createTables = require('./scripts/initTables');

// Importar rotas
const maquinaRoutes = require('./routes/maquinaRoutes');
const monitorRoutes = require('./routes/monitorRoutes');
const devolucaoRoutes = require('./routes/devolucaoRoutes');
const kitRoutes = require('./routes/kitRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const chamadoRoutes = require('./routes/chamadoRoutes');
const skuRoutes = require('./routes/skuRoutes');


class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      // Testar conexões
      const connected = await database.testConnections();
      if (!connected) {
        throw new Error('Não foi possível conectar aos bancos de dados');
      }

      // Criar tabelas se não existirem
      await createTables();
      
      console.log('✅ Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error.message);
      process.exit(1);
    }
  }

  initializeMiddlewares() {
    // CORS
    this.app.use(cors());
    
    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Arquivos estáticos
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  initializeRoutes() {
    // Rotas da API
    this.app.use('/api/maquinas', maquinaRoutes);
    this.app.use('/api/monitores', monitorRoutes);
    this.app.use('/api/kits', kitRoutes);
    this.app.use('/api/devolucao', devolucaoRoutes);
    this.app.use('/api/relatorios', relatorioRoutes);
    this.app.use('/api/chamados', chamadoRoutes);
    this.app.use('/api/skus', skuRoutes);
    
    // Rota de saúde
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'RMA API'
      });
    });
    
    // Rota principal
    this.app.get('/', (req, res) => {
      res.json({
        message: 'API do Sistema RMA Hospedagem',
        version: '1.0.0',
        endpoints: {
          maquinas: '/api/maquinas',
          monitores: '/api/monitores',
          devolucao: '/api/devolucao',
          kit: '/api/kits',
          relatorios: '/api/relatorios',
          chamados: '/api/chamados'
        }
      });
    });
    
    // Rota 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
      });
    });
  }

  initializeErrorHandling() {
    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('❌ Erro não tratado:', err);
      
      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
          ? err.message 
          : 'Erro interno do servidor'
      });
    });
  }

  start() {
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://localhost:${this.port}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

module.exports = App;
