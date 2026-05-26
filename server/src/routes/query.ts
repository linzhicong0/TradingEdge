import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { getDb } from '../db';
import { decrypt } from '../services/crypto';

const router = Router();

function parseConnectionUrl(raw: string) {
  // Normalize schemes to standard URL format
  const normalized = raw
    .replace(/^singlestore:\/\//, 'mysql://');

  const url = new URL(normalized);
  return {
    hostname: url.hostname,
    port: parseInt(url.port || ''),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || undefined,
    ssl: url.searchParams.get('ssl') === 'true',
  };
}

async function executeMySQL(connStr: string, query: string) {
  const url = new URL(connStr.replace(/^singlestore:\/\//, 'mysql://'));
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectTimeout: 10000,
    ssl: url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  try {
    const [rows] = await conn.query(query);
    return { columns: Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : [], rows };
  } finally {
    await conn.end();
  }
}

async function executePostgres(connStr: string, query: string) {
  const pool = new Pool({
    connectionString: connStr,
    max: 1,
    connectionTimeoutMillis: 10000,
  });
  try {
    const result = await pool.query(query);
    return {
      columns: result.fields.map((f) => f.name),
      rows: result.rows,
    };
  } finally {
    await pool.end();
  }
}

async function testMySQL(connStr: string) {
  const url = new URL(connStr.replace(/^singlestore:\/\//, 'mysql://'));
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectTimeout: 5000,
  });
  try {
    await conn.ping();
  } finally {
    await conn.end();
  }
}

async function testPostgres(connStr: string) {
  const pool = new Pool({
    connectionString: connStr,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  try {
    await pool.query('SELECT 1');
  } finally {
    await pool.end();
  }
}

// Execute a query against a datasource
router.post('/execute', async (req: Request, res: Response) => {
  const { datasource_id, query } = req.body;
  if (!datasource_id || !query) {
    res.status(400).json({ error: 'datasource_id and query are required' });
    return;
  }

  const db = getDb();
  const ds = db.prepare('SELECT * FROM datasources WHERE id = ?').get(datasource_id) as any;
  if (!ds) {
    res.status(404).json({ error: 'Datasource not found' });
    return;
  }

  let connStr: string;
  try {
    connStr = decrypt(ds.connection_string_encrypted);
  } catch {
    res.status(500).json({ error: 'Failed to decrypt connection string. Check TRADE_SEED_ENCRYPT_KEY.' });
    return;
  }

  try {
    const isPostgres = ds.type === 'postgres' || connStr.startsWith('postgres');
    const result = isPostgres
      ? await executePostgres(connStr, query)
      : await executeMySQL(connStr, query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Query execution failed' });
  }
});

// Test connection to a datasource
router.post('/test', async (req: Request, res: Response) => {
  const { datasource_id } = req.body;
  if (!datasource_id) {
    res.status(400).json({ error: 'datasource_id is required' });
    return;
  }

  const db = getDb();
  const ds = db.prepare('SELECT * FROM datasources WHERE id = ?').get(datasource_id) as any;
  if (!ds) {
    res.status(404).json({ error: 'Datasource not found' });
    return;
  }

  let connStr: string;
  try {
    connStr = decrypt(ds.connection_string_encrypted);
  } catch {
    res.status(500).json({ error: 'Failed to decrypt connection string' });
    return;
  }

  try {
    const isPostgres = ds.type === 'postgres' || connStr.startsWith('postgres');
    if (isPostgres) {
      await testPostgres(connStr);
    } else {
      await testMySQL(connStr);
    }
    res.json({ success: true, message: 'Connection successful' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Connection failed' });
  }
});

export default router;
