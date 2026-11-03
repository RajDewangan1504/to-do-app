import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const app = express();
const port = process.env.PORT || 3000;
const root = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(root, '../data/tasks.json');
app.use(cors());
app.use(express.json());

async function readTasks() { return JSON.parse(await fs.readFile(dataFile, 'utf8')); }
async function writeTasks(tasks) { await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2)); }
function clean(body) {
  const dueAt = body.dueAt;
  return {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    dueAt,
    startTime: body.startTime || (dueAt ? String(dueAt).slice(11, 16) : '09:00'),
    endTime: body.endTime || (dueAt ? String(dueAt).slice(11, 16) : '10:00'),
    priority: ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium',
    status: body.status === 'completed' ? 'completed' : 'in-progress'
  };
}

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/tasks', async (_, res) => res.json(await readTasks()));
app.post('/api/tasks', async (req, res) => {
  const input = clean(req.body);
  if (!input.title || !input.dueAt) return res.status(400).json({ error: 'Title and date/time are required.' });
  const tasks = await readTasks();
  const task = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  tasks.unshift(task); await writeTasks(tasks); res.status(201).json(task);
});
app.patch('/api/tasks/:id', async (req, res) => {
  const tasks = await readTasks(); const index = tasks.findIndex((task) => task.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Task not found.' });
  const next = { ...tasks[index], ...clean({ ...tasks[index], ...req.body }), updatedAt: new Date().toISOString() };
  tasks[index] = next; await writeTasks(tasks); res.json(next);
});
app.delete('/api/tasks/:id', async (req, res) => {
  const tasks = await readTasks(); const next = tasks.filter((task) => task.id !== req.params.id);
  if (next.length === tasks.length) return res.status(404).json({ error: 'Task not found.' });
  await writeTasks(next); res.status(204).end();
});
app.listen(port, () => console.log(`Taskly API listening on http://localhost:${port}`));
