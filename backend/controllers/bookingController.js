const BookingModel = require('../models/bookingModel');

const BookingController = {

  getAll: (req, res) => {
    BookingModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  getByUtente: (req, res) => {
    BookingModel.getByUtente(req.params.utente_id, (err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  getById: (req, res) => {
    BookingModel.getById(req.params.id, (err, row) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!row) return res.status(404).json({ errore: 'Prenotazione non trovata' });
      res.json(row);
    });
  },

  create: (req, res) => {
    const { camera_id, data_inizio, data_fine, stato } = req.body;
    const utente_id = req.user.id;

    BookingModel.create(
      { utente_id, camera_id, data_inizio, data_fine, stato },
      function(err) {
        if (err) return res.status(500).json({ errore: err.message });
        res.status(201).json({ messaggio: 'Prenotazione creata con successo', id: this.lastID });
      }
    );
  },

  updateStato: (req, res) => {
    const { stato } = req.body;
    BookingModel.updateStato(req.params.id, stato, (err) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json({ messaggio: 'Stato prenotazione aggiornato' });
    });
  },

  deleteById: (req, res) => {
    BookingModel.deleteById(req.params.id, (err) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json({ messaggio: 'Prenotazione eliminata con successo' });
    });
  }

};

module.exports = BookingController;
