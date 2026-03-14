import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'movrr.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    assignee TEXT DEFAULT 'both',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS move_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    moveOutDate TEXT NOT NULL,
    moveInDate TEXT NOT NULL
  );
`);

// Seed default move config if none exists
const existing = db.prepare('SELECT id FROM move_config WHERE id = 1').get();
if (!existing) {
  const today = new Date();
  const moveOut = new Date(today);
  moveOut.setDate(moveOut.getDate() + 30);
  const moveIn = new Date(moveOut);
  moveIn.setDate(moveIn.getDate() + 3);

  db.prepare('INSERT INTO move_config (id, moveOutDate, moveInDate) VALUES (1, ?, ?)').run(
    moveOut.toISOString().split('T')[0],
    moveIn.toISOString().split('T')[0]
  );
}

const app = express();
app.use(cors());
app.use(express.json());

// --- Tasks ---

app.get('/api/tasks', (_req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY startDate').all();
  res.json(tasks.map(t => ({ ...t as Record<string, unknown>, completed: !!(t as Record<string, unknown>).completed })));
});

app.post('/api/tasks', (req, res) => {
  const { id, title, category, startDate, endDate, notes, assignee } = req.body;
  db.prepare(
    'INSERT INTO tasks (id, title, category, startDate, endDate, notes, assignee) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, title, category, startDate, endDate, notes || '', assignee || 'both');
  res.status(201).json({ id });
});

app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    fields.push(`${key} = ?`);
    values.push(key === 'completed' ? (value ? 1 : 0) : value);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Move Config ---

app.get('/api/config', (_req, res) => {
  const config = db.prepare('SELECT moveOutDate, moveInDate FROM move_config WHERE id = 1').get();
  res.json(config);
});

app.patch('/api/config', (req, res) => {
  const updates = req.body;
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length > 0) {
    db.prepare(`UPDATE move_config SET ${fields.join(', ')} WHERE id = 1`).run(...values);
  }
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Movrr API running on http://localhost:${PORT}`);
});
