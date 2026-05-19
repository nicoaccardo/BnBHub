const RoomModel = require('../models/roomModel');

const RoomController = {

  getAll: (req, res) => {
    RoomModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  getById: (req, res) => {
    RoomModel.getById(req.params.id, (err, row) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!row) return res.status(404).json({ errore: 'Camera non trovata' });
      res.json(row);
    });
  },

  getDisponibili: (req, res) => {
    RoomModel.getDisponibili((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  create: (req, res) => {
    RoomModel.create(req.body, function(err) {
      if (err) return res.status(500).json({ errore: err.message });
      res.status(201).json({ messaggio: 'Camera creata con successo', id: this.lastID });
    });
  },

  update: (req, res) => {
    RoomModel.update(req.params.id, req.body, function(err) {
      if (err) return res.status(500).json({ errore: err.message });
      res.json({ messaggio: 'Camera aggiornata con successo' });
    });
  },

  deleteById: (req, res) => {
    RoomModel.deleteById(req.params.id, (err) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json({ messaggio: 'Camera eliminata con successo' });
    });
  }

};

module.exports = RoomController;