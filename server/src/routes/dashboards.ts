import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';

const router = Router();

// List all dashboards with tile count
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.*, COUNT(t.id) as tile_count
    FROM dashboards d
    LEFT JOIN tiles t ON t.dashboard_id = d.id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `).all();
  res.json(rows);
});

// Get a single dashboard with its tiles
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(req.params.id) as any;
  if (!dashboard) {
    res.status(404).json({ error: 'Dashboard not found' });
    return;
  }
  const tiles = db.prepare(
    'SELECT * FROM tiles WHERE dashboard_id = ? ORDER BY pos_y, pos_x'
  ).all(req.params.id);
  res.json({ ...dashboard, tiles });
});

// Create a dashboard
router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const id = uuidv4();
  const db = getDb();
  db.prepare('INSERT INTO dashboards (id, name) VALUES (?, ?)').run(id, name);
  const row = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);
  res.status(201).json({ ...(row as any), tiles: [] });
});

// Update a dashboard name
router.put('/:id', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const db = getDb();
  const result = db.prepare(
    'UPDATE dashboards SET name = ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).run(name, req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Dashboard not found' });
    return;
  }
  const row = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(req.params.id);
  res.json(row);
});

// Delete a dashboard
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM dashboards WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Dashboard not found' });
    return;
  }
  res.json({ success: true });
});

// --- Tile routes (nested under dashboard) ---

// Create a tile
router.post('/:dashboardId/tiles', (req: Request, res: Response) => {
  const { dashboardId } = req.params;
  const db = getDb();
  const dashboard = db.prepare('SELECT id FROM dashboards WHERE id = ?').get(dashboardId);
  if (!dashboard) {
    res.status(404).json({ error: 'Dashboard not found' });
    return;
  }

  const id = uuidv4();
  const {
    title = 'Untitled Tile',
    query = 'SELECT 1',
    datasource_id = null,
    view_type = 'table',
    view_config = '{}',
    pos_x = 0,
    pos_y = 0,
    col_span = 3,
    row_span = 2
  } = req.body;

  db.prepare(`
    INSERT INTO tiles (id, dashboard_id, title, query, datasource_id, view_type, view_config, pos_x, pos_y, col_span, row_span)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, dashboardId, title, query, datasource_id, view_type, typeof view_config === 'string' ? view_config : JSON.stringify(view_config), pos_x, pos_y, col_span, row_span);

  const tile = db.prepare('SELECT * FROM tiles WHERE id = ?').get(id);
  res.status(201).json(tile);
});

// Update a tile
router.put('/:dashboardId/tiles/:tileId', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tiles WHERE id = ? AND dashboard_id = ?')
    .get(req.params.tileId, req.params.dashboardId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Tile not found' });
    return;
  }

  const {
    title = existing.title,
    query = existing.query,
    datasource_id = existing.datasource_id,
    view_type = existing.view_type,
    view_config = existing.view_config,
    pos_x = existing.pos_x,
    pos_y = existing.pos_y,
    col_span = existing.col_span,
    row_span = existing.row_span
  } = req.body;

  const vc = typeof view_config === 'string' ? view_config : JSON.stringify(view_config);
  db.prepare(`
    UPDATE tiles SET title=?, query=?, datasource_id=?, view_type=?, view_config=?, pos_x=?, pos_y=?, col_span=?, row_span=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, query, datasource_id, view_type, vc, pos_x, pos_y, col_span, row_span, req.params.tileId);

  const tile = db.prepare('SELECT * FROM tiles WHERE id = ?').get(req.params.tileId);
  res.json(tile);
});

// Update tile layout only (for dnd/resize)
router.patch('/:dashboardId/tiles/:tileId/layout', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tiles WHERE id = ? AND dashboard_id = ?')
    .get(req.params.tileId, req.params.dashboardId);
  if (!existing) {
    res.status(404).json({ error: 'Tile not found' });
    return;
  }

  const { pos_x, pos_y, col_span, row_span } = req.body;
  db.prepare(`
    UPDATE tiles SET pos_x=?, pos_y=?, col_span=?, row_span=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    pos_x ?? (existing as any).pos_x,
    pos_y ?? (existing as any).pos_y,
    col_span ?? (existing as any).col_span,
    row_span ?? (existing as any).row_span,
    req.params.tileId
  );

  const tile = db.prepare('SELECT * FROM tiles WHERE id = ?').get(req.params.tileId);
  res.json(tile);
});

// Delete a tile
router.delete('/:dashboardId/tiles/:tileId', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM tiles WHERE id = ? AND dashboard_id = ?'
  ).run(req.params.tileId, req.params.dashboardId);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Tile not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
