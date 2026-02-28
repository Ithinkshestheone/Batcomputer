import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'batcomputer-secret-key-123';
const db = new Database('arcade.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const result = stmt.run(username, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: result.lastInsertRowid, username });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, username: user.username });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Score Routes
  app.get('/api/scores', authenticate, (req: any, res) => {
    const scores = db.prepare('SELECT * FROM scores WHERE user_id = ?').all(req.user.id);
    res.json(scores);
  });

  app.post('/api/scores', authenticate, (req: any, res) => {
    const { game_id, score } = req.body;
    const existing: any = db.prepare('SELECT * FROM scores WHERE user_id = ? AND game_id = ?').get(req.user.id, game_id);
    
    if (existing) {
      if (score > existing.score) {
        db.prepare('UPDATE scores SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(score, existing.id);
      }
    } else {
      db.prepare('INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)').run(req.user.id, game_id, score);
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
