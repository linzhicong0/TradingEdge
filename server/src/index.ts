import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import datasourceRoutes from './routes/datasources';
import dashboardRoutes from './routes/dashboards';
import queryRoutes from './routes/query';
import { getDb } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
getDb();

// Routes
app.use('/api/datasources', datasourceRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/query', queryRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 TradingEdge server running on http://localhost:${PORT}`);
});
