import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../database/lavacar.db');
const DB_DIR = path.dirname(DB_PATH);

// Criar pasta database se não existir
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database | null = null;
let isInitialized = false;

// Função para salvar o banco em disco
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
};

// Função para inicializar o banco (será chamada uma vez)
const initDatabaseSync = async () => {
  if (isInitialized) return;

  try {
    const SQL = await initSqlJs();

    // Se o banco já existe, carregar do disco
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('✅ Banco de dados carregado do disco');
    } else {
      // Criar novo banco em memória
      db = new SQL.Database();
      console.log('✅ Novo banco de dados criado');
    }

    // Habilitar foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Criar tabelas se não existirem
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        placa TEXT UNIQUE NOT NULL,
        telefone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS lavagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        tipo_lavagem TEXT NOT NULL,
        placa TEXT,
        nome_cliente TEXT,
        telefone TEXT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        valor REAL NOT NULL,
        forma_pagamento TEXT NOT NULL CHECK(forma_pagamento IN ('dinheiro', 'pix', 'cartao')),
        observacao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS despesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        tipo TEXT NOT NULL CHECK(tipo IN ('funcionario', 'produto', 'marmita', 'aluguel', 'conta', 'outro')),
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        observacao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS fechamentos_diarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data DATE UNIQUE NOT NULL,
        total_lavagens INTEGER NOT NULL,
        receita_total REAL NOT NULL,
        receita_dinheiro REAL NOT NULL,
        receita_pix REAL NOT NULL,
        receita_cartao REAL NOT NULL,
        despesa_total REAL NOT NULL,
        despesa_funcionario REAL NOT NULL,
        despesa_produto REAL NOT NULL,
        despesa_marmita REAL NOT NULL,
        despesa_outros REAL NOT NULL,
        lucro_liquido REAL NOT NULL,
        observacao TEXT,
        encerrado_por TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Índices para performance
    db.run('CREATE INDEX IF NOT EXISTS idx_clientes_placa ON clientes(placa)');
    db.run('CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)');
    db.run('CREATE INDEX IF NOT EXISTS idx_lavagens_data ON lavagens(data)');
    db.run(
      'CREATE INDEX IF NOT EXISTS idx_lavagens_cliente ON lavagens(cliente_id)'
    );
    db.run('CREATE INDEX IF NOT EXISTS idx_lavagens_placa ON lavagens(placa)');
    db.run(
      'CREATE INDEX IF NOT EXISTS idx_lavagens_tipo ON lavagens(tipo_lavagem)'
    );
    db.run('CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data)');
    db.run('CREATE INDEX IF NOT EXISTS idx_despesas_tipo ON despesas(tipo)');
    db.run(
      'CREATE INDEX IF NOT EXISTS idx_fechamentos_data ON fechamentos_diarios(data)'
    );

    // Salvar banco em disco
    saveDatabase();

    isInitialized = true;
    console.log('✅ Banco de dados inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  }
};

// Objeto de conexão simulando better-sqlite3
const dbWrapper = {
  prepare: (sql: string) => {
    if (!db) throw new Error('Database not initialized');

    return {
      run: (...params: any[]) => {
        try {
          const stmt = db!.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();

          // Obter lastInsertRowid
          const result = db!.exec('SELECT last_insert_rowid() as id');
          const lastInsertRowid = result[0]?.values[0]?.[0] || 0;

          saveDatabase();
          return { lastInsertRowid };
        } catch (error) {
          console.error('Erro ao executar run:', error);
          throw error;
        }
      },
      get: (...params: any[]) => {
        const stmt = db!.prepare(sql);
        stmt.bind(params);

        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          stmt.free();

          const row: any = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });
          return row;
        }

        stmt.free();
        return undefined;
      },
      all: (...params: any[]) => {
        const stmt = db!.prepare(sql);
        stmt.bind(params);

        const result: any[] = [];
        const columns = stmt.getColumnNames();

        while (stmt.step()) {
          const values = stmt.get();
          const row: any = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });
          result.push(row);
        }

        stmt.free();
        return result;
      },
    };
  },
  close: () => {
    if (db) {
      saveDatabase();
      db.close();
      db = null;
      isInitialized = false;
    }
  },
};

// Inicializar banco
initDatabaseSync();

export default dbWrapper;
export { initDatabaseSync, saveDatabase };
