require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./src/middlewares/errorHandler');
const corsOptions = require('./src/config/cors');

const app = express();

// Pré-flight CORS : répondre à toutes les routes OPTIONS avant tout autre middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use('/public', express.static('public'));

// Routes
app.use('/api/auth',          require('./src/routes/auth.routes'));
app.use('/api/users',         require('./src/routes/users.routes'));
app.use('/api/tontines',      require('./src/routes/tontines.routes'));
app.use('/api/cotisations',   require('./src/routes/cotisations.routes'));
app.use('/api/distributions', require('./src/routes/distributions.routes'));
app.use('/api/invitations',   require('./src/routes/invitations.routes'));
app.use('/api/verifications', require('./src/routes/verifications.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));

app.use(errorHandler);

// ── Socket.io ────────────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: corsOptions.methods,
  },
});

io.use((socket, next) => {
  const { verifyAccessToken } = require('./src/utils/helpers');
  const user = verifyAccessToken(socket.handshake.auth.token);
  if (!user) return next(new Error('Non authentifie'));
  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  socket.on('join_room', async ({ tontineId }) => {
    socket.join(tontineId);
    
    // Fetch last 50 messages
    try {
      const db = require('./src/config/db');
      const { rows } = await db.query(
        `SELECT m.*, u.nom as "senderNom", u.prenom as "senderPrenom" 
         FROM "Message" m
         JOIN "User" u ON m."senderId" = u.id
         WHERE m."tontineId" = $1 
         ORDER BY m."dateEnvoi" DESC 
         LIMIT 50`,
        [tontineId]
      );
      // Map names for frontend
      const history = rows.map(r => ({
        ...r,
        senderName: `${r.senderPrenom || ''} ${r.senderNom || ''}`.trim()
      }));
      socket.emit('chat_history', history);
    } catch (err) {
      console.error('[Socket] chat_history error:', err);
    }
  });

  socket.on('send_message', async ({ tontineId, contenu }) => {
    const db = require('./src/config/db');
    try {
      const { rows } = await db.query(
        `INSERT INTO "Message" ("tontineId", "senderId", "contenu") VALUES ($1, $2, $3) RETURNING *`,
        [tontineId, socket.user.id, contenu]
      );
      
      const message = rows[0];
      
      // Si les noms ne sont pas dans le JWT (plus robuste d'aller chercher en base si besoin)
      let name = `${socket.user.prenom || ''} ${socket.user.nom || ''}`.trim();
      let nom = socket.user.nom;
      let prenom = socket.user.prenom;

      if (!name) {
        const uRes = await db.query('SELECT nom, prenom FROM "User" WHERE id=$1', [socket.user.id]);
        if (uRes.rows[0]) {
          nom = uRes.rows[0].nom;
          prenom = uRes.rows[0].prenom;
          name = `${prenom || ''} ${nom || ''}`.trim();
        }
      }

      message.senderName = name || 'Utilisateur';
      message.senderNom = nom;
      message.senderPrenom = prenom;
      
      io.to(tontineId).emit('new_message', message);
    } catch (err) {
      console.error('[Socket] send_message error:', err);
    }
  });

  socket.on('disconnect', () => {});
});

// CRON
require('./src/jobs/cron');


// ── Sécurité process ─────────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));

