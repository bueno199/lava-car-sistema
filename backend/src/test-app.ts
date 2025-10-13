import express, { Express } from 'express';
import cors from 'cors';
import clientesRouter from './routes/clientes';
import lavagensRouter from './routes/lavagens';
import fechamentoRouter from './routes/fechamento';
import despesasRouter from './routes/despesas';
import relatoriosRouter from './routes/relatorios';

export function createTestApp(): Express {
  const app: Express = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rotas
  app.get('/api/health', (req, res) => {
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

  // Error handler
  app.use((err: Error, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}
