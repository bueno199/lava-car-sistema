import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import db, { initDatabaseSync } from './db/database';

// Rotas
import clientesRouter from './routes/clientes';
import lavagensRouter from './routes/lavagens';
import fechamentoRouter from './routes/fechamento';
import despesasRouter from './routes/despesas';
import relatoriosRouter from './routes/relatorios';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARES
// ========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ========================================
// ROTAS
// ========================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/clientes', clientesRouter);
app.use('/api/lavagens', lavagensRouter);
app.use('/api/fechamento', fechamentoRouter);
app.use('/api/despesas', despesasRouter);
app.use('/api/relatorios', relatoriosRouter);

// ========================================
// ERROR HANDLER
// ========================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// ========================================
// BACKUP AUTOMÁTICO (CRON JOB)
// ========================================

const BACKUP_CRON = process.env.BACKUP_CRON || '0 23 * * *';

cron.schedule(BACKUP_CRON, async () => {
  console.log(
    '[CRON] Backup automático agendado (implementar lógica de backup)'
  );
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initDatabaseSync();
    console.log('✅ Conectado ao banco de dados SQLite');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔄 Backup automático agendado: ${BACKUP_CRON}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  db.close();
  process.exit(0);
});

startServer();

export { db };
