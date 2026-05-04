require('dotenv').config();
const App = require('./app');

// Carregar variáveis de ambiente
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🌍 Ambiente: ${NODE_ENV}`);
console.log(`🔧 Porta: ${PORT}`);

// Inicializar aplicação
const app = new App();

// Tratar encerramento gracioso
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando aplicação...');
  process.exit(0);  
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando aplicação...');
  process.exit(0);
});

// Iniciar servidor
app.start().catch((error) => {
  console.error('Falha ao iniciar servidor:', error.message);
  process.exit(1);
});
