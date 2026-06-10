const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getCorsOrigins } = require('./config/security');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

function createCorsOptions(allowedOrigins) {
  const originWhitelist = new Set(allowedOrigins);

  return {
    origin(origin, callback) {
      if (!origin || originWhitelist.has(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error('Origin CORS non consentito');
      error.code = 'CORS_NOT_ALLOWED';
      callback(error);
    }
  };
}

function createApp(options = {}) {
  const app = express();
  const allowedOrigins = options.corsOrigins || getCorsOrigins();

  app.use(helmet());
  app.use(cors(createCorsOptions(allowedOrigins)));
  app.use(express.json());
  app.use('/users', userRoutes);
  app.use('/auth', authRoutes);
  app.use('/rooms', roomRoutes);
  app.use('/bookings', bookingRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/reviews', reviewRoutes);

  app.get('/', (req, res) => {
    res.json({ messaggio: 'Server attivo e funzionante!' });
  });

  app.use((err, _req, res, next) => {
    if (err.code === 'CORS_NOT_ALLOWED') {
      return res.status(403).json({ errore: err.message });
    }

    next(err);
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
module.exports.createCorsOptions = createCorsOptions;
