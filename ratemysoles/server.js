import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import db from './src/db.js';
import {
  processUpload,
  deleteFiles,
  isAcceptedMime,
  MAX_BYTES,
  UPLOAD_DIR,
} from './src/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error('SESSION_SECRET must be set in production.');
      })()
    : 'dev-secret-change-me');
const ADMIN_KEY = process.env.ADMIN_KEY || ''; // empty => admin endpoints disabled

const app = express();
app.set('trust proxy', 1); // honor X-Forwarded-* when behind a reverse proxy

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser(SESSION_SECRET));

// --- Visitor identity ------------------------------------------------------
// No accounts. Every visitor gets a signed, random token cookie that anchors
// "one vote per photo" and attributes uploads, without collecting any PII.
app.use((req, res, next) => {
  let token = req.signedCookies?.voter;
  if (!token) {
    token = crypto.randomUUID();
    res.cookie('voter', token, {
      httpOnly: true,
      sameSite: 'lax',
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }
  req.voter = token;
  next();
});

// --- Static files ----------------------------------------------------------
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '7d',
    immutable: true,
    setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'same-origin'),
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers ---------------------------------------------------------------
const PRIOR_VOTES = 5; // Bayesian smoothing weight
const PRIOR_MEAN = 5.5; // assumed average for a brand-new photo

function shapePhoto(row, voter) {
  const myVoteRow = db
    .prepare('SELECT score FROM votes WHERE photo_id = ? AND voter = ?')
    .get(row.id, voter);
  return {
    id: row.id,
    title: row.title,
    url: `/uploads/${row.filename}`,
    thumbUrl: `/uploads/${row.thumb}`,
    width: row.width,
    height: row.height,
    votes: row.votes ?? 0,
    average: row.votes ? Number((row.sum / row.votes).toFixed(2)) : null,
    createdAt: row.created_at,
    myVote: myVoteRow ? myVoteRow.score : null,
  };
}

const FEED_SQL = `
  SELECT p.*,
         COUNT(v.score)            AS votes,
         COALESCE(SUM(v.score), 0) AS sum
  FROM photos p
  LEFT JOIN votes v ON v.photo_id = p.id
  WHERE p.status = 'active'
  GROUP BY p.id
`;

// --- Rate limiters ---------------------------------------------------------
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads from this address. Try again later.' },
});
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Upload (multer in memory; sharp validates + strips metadata) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (isAcceptedMime(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed.'));
  },
});

// ===========================================================================
// API
// ===========================================================================

app.get('/api/feed', (req, res) => {
  const sort = req.query.sort === 'top' ? 'top' : 'new';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const perPage = 24;
  const offset = (page - 1) * perPage;

  const order =
    sort === 'top'
      ? `(sum + ${PRIOR_VOTES * PRIOR_MEAN}) / (votes + ${PRIOR_VOTES}) DESC, votes DESC, p.created_at DESC`
      : `p.created_at DESC`;

  const rows = db
    .prepare(`${FEED_SQL} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(perPage, offset);
  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM photos WHERE status = 'active'`)
    .get().n;

  res.json({
    sort,
    page,
    perPage,
    total,
    hasMore: offset + rows.length < total,
    photos: rows.map((r) => shapePhoto(r, req.voter)),
  });
});

app.get('/api/photo/:id', (req, res) => {
  const row = db
    .prepare(`${FEED_SQL} HAVING p.id = ?`)
    .get(req.params.id);
  if (!row || row.status !== 'active') {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json(shapePhoto(row, req.voter));
});

app.post('/api/upload', uploadLimiter, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image is larger than the 8 MB limit.'
          : err.message;
      return res.status(status).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    if (req.body.consent !== 'true') {
      return res
        .status(400)
        .json({ error: 'You must confirm the upload rules to continue.' });
    }

    const title = String(req.body.title || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);

    try {
      const img = await processUpload(req.file.buffer);
      const info = db
        .prepare(
          `INSERT INTO photos (title, filename, thumb, width, height, uploader, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(title, img.filename, img.thumb, img.width, img.height, req.voter, Date.now());
      const row = db.prepare(`${FEED_SQL} HAVING p.id = ?`).get(info.lastInsertRowid);
      res.status(201).json(shapePhoto(row, req.voter));
    } catch (e) {
      res.status(400).json({ error: e.message || 'Could not process image.' });
    }
  });
});

app.post('/api/photo/:id/vote', voteLimiter, (req, res) => {
  const score = parseInt(req.body?.score, 10);
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'Score must be a whole number from 1 to 10.' });
  }
  const photo = db
    .prepare(`SELECT id FROM photos WHERE id = ? AND status = 'active'`)
    .get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Not found.' });

  db.prepare(
    `INSERT INTO votes (photo_id, voter, score, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(photo_id, voter) DO UPDATE SET score = excluded.score, created_at = excluded.created_at`
  ).run(photo.id, req.voter, score, Date.now());

  const row = db.prepare(`${FEED_SQL} HAVING p.id = ?`).get(photo.id);
  res.json(shapePhoto(row, req.voter));
});

app.post('/api/photo/:id/report', voteLimiter, (req, res) => {
  const photo = db
    .prepare(`SELECT id FROM photos WHERE id = ? AND status = 'active'`)
    .get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Not found.' });
  const reason = String(req.body?.reason || '').trim().slice(0, 300);
  db.prepare(
    `INSERT INTO reports (photo_id, reporter, reason, created_at) VALUES (?, ?, ?, ?)`
  ).run(photo.id, req.voter, reason, Date.now());
  res.json({ ok: true });
});

// --- Admin moderation (enabled only when ADMIN_KEY is set) -----------------
function requireAdmin(req, res, next) {
  if (!ADMIN_KEY) return res.status(404).json({ error: 'Not found.' });
  if (req.get('x-admin-key') !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

app.get('/api/admin/reports', requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.photo_id, r.reason, r.created_at,
              p.title, p.thumb, p.status
       FROM reports r JOIN photos p ON p.id = r.photo_id
       ORDER BY r.created_at DESC LIMIT 200`
    )
    .all();
  res.json({ reports: rows });
});

app.delete('/api/admin/photo/:id', requireAdmin, async (req, res) => {
  const row = db.prepare(`SELECT filename, thumb FROM photos WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found.' });
  db.prepare(`UPDATE photos SET status = 'removed' WHERE id = ?`).run(req.params.id);
  await deleteFiles(row.filename, row.thumb);
  res.json({ ok: true });
});

// --- Fallthrough -----------------------------------------------------------
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`RateMySoles listening on http://localhost:${PORT}`);
  if (!ADMIN_KEY) console.log('Admin endpoints disabled (set ADMIN_KEY to enable moderation).');
});
