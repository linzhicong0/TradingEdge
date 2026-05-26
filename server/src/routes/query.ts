import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getDb } from '../db';
import { decrypt } from '../services/crypto';

const router = Router();

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

  let connectionString: string;
  try {
    connectionString = decrypt(ds.connection_string_encrypted);
  } catch {
    res.status(500).json({ error: 'Failed to decrypt connection string. Check TRADE_SEED_ENCRYPT_KEY.' });
    return;
  }

  // Parse connection string - supports mysql://user:pass@host:port/database format
  // and SingleStore standard format: singlestore://user:pass@host:port/database
  let conn: mysql.Connection | null = null;
  try {
    const url = new URL(
      connectionString
        .replace(/^singlestore:\/\//, 'mysql://')
        .replace(/^postgres(ql)?:\/\//, 'mysql://')
    );

    conn = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      connectTimeout: 10000,
      ssl: url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    const [rows] = await conn.query(query);
    res.json({ columns: Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : [], rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Query execution failed' });
  } finally {
    if (conn) {
      await conn.end();
    }
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

  let connectionString: string;
  try {
    connectionString = decrypt(ds.connection_string_encrypted);
  } catch {
    res.status(500).json({ error: 'Failed to decrypt connection string' });
    return;
  }

  try {
    const url = new URL(
      connectionString
        .replace(/^singlestore:\/\//, 'mysql://')
        .replace(/^postgres(ql)?:\/\//, 'mysql://')
    );

    const conn = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      connectTimeout: 5000,
    });

    await conn.ping();
    await conn.end();
    res.json({ success: true, message: 'Connection successful' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Connection failed' });
  }
});

export default router;
