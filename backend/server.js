require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

// Rotta base di test
app.get('/', (req, res) => {
  res.json({ messaggio: 'Server attivo e funzionante!' });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
