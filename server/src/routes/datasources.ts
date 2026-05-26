import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { encrypt, decrypt } from '../services/crypto';

const router = Router();

// List all datasources (never return decrypted connection strings)
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, name, type, created_at, updated_at FROM datasources ORDER BY created_at DESC'
  ).all();
  res.json(rows);
});

// Get a single datasource (with decrypted connection string)
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ error: 'Datasource not found' });
    return;
  }
  try {
    row.connection_string = decrypt(row.connection_string_encrypted);
    delete row.connection_string_encrypted;
  } catch {
    res.status(500).json({ error: 'Failed to decrypt connection string' });
    return;
  }
  res.json(row);
});

// Create a datasource
router.post('/', (req: Request, res: Response) => {
  const { name, type = 'singlestore', connection_string } = req.body;
  if (!name || !connection_string) {
    res.status(400).json({ error: 'name and connection_string are required' });
    return;
  }

  const id = uuidv4();
  const encrypted = encrypt(connection_string);
  const db = getDb();
  db.prepare(
    'INSERT INTO datasources (id, name, type, connection_string_encrypted) VALUES (?, ?, ?, ?)'
  ).run(id, name, type, encrypted);

  const row = db.prepare(
    'SELECT id, name, type, created_at, updated_at FROM datasources WHERE id = ?'
  ).get(id);
  res.status(201).json(row);
});

// Update a datasource
router.put('/:id', (req: Request, res: Response) => {
  const { name, connection_string } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Datasource not found' });
    return;
  }

  const newName = name || existing.name;
  const encrypted = connection_string ? encrypt(connection_string) : existing.connection_string_encrypted;

  db.prepare(
    'UPDATE datasources SET name = ?, connection_string_encrypted = ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).run(newName, encrypted, req.params.id);

  const row = db.prepare(
    'SELECT id, name, type, created_at, updated_at FROM datasources WHERE id = ?'
  ).get(req.params.id);
  res.json(row);
});

// Delete a datasource
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM datasources WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Datasource not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
