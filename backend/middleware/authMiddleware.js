const jwt = require('jsonwebtoken');
const { JWT_ALGORITHM, getJwtSecret } = require('../config/security');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ errore: 'Token mancante' });

  jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] }, (err, decoded) => {
    if (err) return res.status(403).json({ errore: 'Token non valido o scaduto' });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.ruolo !== 'admin') {
    return res.status(403).json({ errore: 'Accesso riservato agli amministratori' });
  }
  next();
};

const verifyUser = (req, res, next) => {
  if (!req.user || req.user.ruolo !== 'user') {
    return res.status(403).json({ errore: 'Operazione riservata agli utenti' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyUser };
