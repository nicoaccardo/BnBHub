require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET = 'chiave_segreta_bnb';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ errore: 'Token mancante' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ errore: 'Token non valido o scaduto' });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user.ruolo !== 'admin') {
    return res.status(403).json({ errore: 'Accesso riservato agli amministratori' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };