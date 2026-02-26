require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./src/middlewares/errorHandler');
const corsOptions = require('./src/config/cors');

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth',          require('./src/routes/auth.routes'));
app.use('/api/users',         require('./src/routes/users.routes'));
app.use('/api/tontines',      require('./src/routes/tontines.routes'));
app.use('/api/cotisations',   require('./src/routes/cotisations.routes'));
app.use('/api/distributions', require('./src/routes/distributions.routes'));
app.use('/api/contrats',      require('./src/routes/contrats.routes'));
app.use('/api/invitations',   require('./src/routes/invitations.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));

app.use(errorHandler);

// Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });

io.use((socket, next) => {
  const { verifyAccessToken } = require('./src/utils/helpers');
  const user = verifyAccessToken(socket.handshake.auth.token);
  if (!user) return next(new Error('Non authentifie'));
  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  socket.on('join_room', ({ tontineId }) => socket.join(tontineId));

  socket.on('send_message', async ({ tontineId, contenu }) => {
    const db = require('./src/config/db');
    const { rows } = await db.query(
      `INSERT INTO "Message" ("tontineId","senderId","contenu") VALUES ($1,$2,$3) RETURNING *`,
      [tontineId, socket.user.id, contenu]
    );
    io.to(tontineId).emit('new_message', rows[0]);
  });

  socket.on('disconnect', () => {});
});

// CRON
require('./src/jobs/cron');

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));