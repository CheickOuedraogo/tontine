require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middlewares/errorHandler');
const { protect } = require('./middlewares/auth.middleware');
const msgQ = require('./queries/notification.queries');

const app = express();

// CORS pour les requêtes API
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/tontines', require('./routes/tontines.routes'));
app.use('/api/cotisations', require('./routes/cotisations.routes'));
app.use('/api/distributions', require('./routes/distributions.routes'));
app.use('/api/contrats', require('./routes/contrats.routes'));
app.use('/api/invitations', require('./routes/invitations.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

app.use(errorHandler);

// Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });

io.use((socket, next) => {
  const { verifyAccessToken } = require('./utils/helpers');
  const user = verifyAccessToken(socket.handshake.auth.token);
  if (!user) return next(new Error('Non authentifie'));
  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  // join_room({tontineId}) => rejoint la room + envoie l'historique
  socket.on('join_room', async ({ tontineId }) => {
    socket.join(tontineId);
    // Auto-send history
    try {
      const db = require('./config/db');
      const { rows } = await db.query(
        `SELECT m.*, u.nom AS "senderNom", u.prenom AS "senderPrenom"
         FROM "Message" m JOIN "User" u ON u.id = m."senderId"
         WHERE m."tontineId" = $1
         ORDER BY m."dateEnvoi" DESC LIMIT 100`, [tontineId]
      );
      const history = rows.map(r => ({
        ...r,
        senderName: `${r.senderPrenom} ${r.senderNom}`
      }));
      socket.emit('chat_history', history);
    } catch (err) {
      console.error('[Socket] load_history error:', err.message);
    }
  });

  // send_message({tontineId, contenu}) => broadcast new_message a la room
  socket.on('send_message', async ({ tontineId, contenu }) => {
    const db = require('./config/db');
    const { rows } = await db.query(
      `INSERT INTO "Message" ("tontineId","senderId","contenu") VALUES ($1,$2,$3) RETURNING *`,
      [tontineId, socket.user.id, contenu]
    );
    // Get sender name
    const { rows: userRows } = await db.query(
      `SELECT nom, prenom FROM "User" WHERE id=$1`, [socket.user.id]
    );
    const msg = {
      ...rows[0],
      senderName: userRows[0] ? `${userRows[0].prenom} ${userRows[0].nom}` : ''
    };
    io.to(tontineId).emit('new_message', msg);
  });

  socket.on('disconnect', () => { });
});

// CRON
require('./jobs/cron');

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));
