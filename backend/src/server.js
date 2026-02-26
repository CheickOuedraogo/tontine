require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middlewares/errorHandler');
const { protect } = require('./middlewares/auth.middleware');
const msgQ = require('./queries/notification.queries');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/users.routes'));
app.use('/api/tontines',      require('./routes/tontines.routes'));
app.use('/api/cotisations',   require('./routes/cotisations.routes'));
app.use('/api/distributions', require('./routes/distributions.routes'));
app.use('/api/contrats',      require('./routes/contrats.routes'));
app.use('/api/invitations',   require('./routes/invitations.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

app.use(errorHandler);

// Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });

io.use((socket, next) => {
  const { verifyAccessToken } = require('./utils/helpers');
  const user = verifyAccessToken(socket.handshake.auth.token);
  if (!user) return next(new Error('Non authentifie'));
  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  // join_room({tontineId}) => rejoint la room de la tontine
  socket.on('join_room', ({ tontineId }) => socket.join(tontineId));

  // send_message({tontineId, contenu}) => broadcast new_message a la room
  socket.on('send_message', async ({ tontineId, contenu }) => {
    const db = require('./config/db');
    const { rows } = await db.query(
      `INSERT INTO "Message" ("tontineId","senderId","contenu") VALUES ($1,$2,$3) RETURNING *`,
      [tontineId, socket.user.id, contenu]
    );
    io.to(tontineId).emit('new_message', rows[0]);
  });

  socket.on('disconnect', () => {});
});

// CRON
require('./jobs/cron');

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));
