const RoomModel = require('../models/roomModel');

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

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
    const { data_inizio, data_fine, ospiti } = req.query;
    const hasDateFilter = data_inizio || data_fine;

    if (hasDateFilter) {
      if (!isValidDate(data_inizio) || !isValidDate(data_fine)) {
        return res.status(400).json({ errore: 'Inserisci date valide nel formato YYYY-MM-DD' });
      }

      if (data_fine <= data_inizio) {
        return res.status(400).json({ errore: 'La data di check-out deve essere successiva al check-in' });
      }
    }

    const ospitiNumber = ospiti ? Number(ospiti) : undefined;

    if (ospitiNumber !== undefined && (!Number.isInteger(ospitiNumber) || ospitiNumber < 1)) {
      return res.status(400).json({ errore: 'Il numero di ospiti deve essere valido' });
    }

    RoomModel.getDisponibili({
      data_inizio,
      data_fine,
      ospiti: ospitiNumber
    }, (err, rows) => {
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
