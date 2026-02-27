// Configuration CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // En dev, on autorise tout
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
