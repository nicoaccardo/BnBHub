const express = require('express');
const cors = require('cors');
const db = require('./database');
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

// Rotta base di test
app.get('/', (req, res) => {
  res.json({ messaggio: 'Server attivo e funzionante!' });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
