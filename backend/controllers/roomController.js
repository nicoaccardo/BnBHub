const RoomModel = require('../models/roomModel');

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isFilledString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validateImageUrl(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return null;
  }

  let url;

  try {
    url = new URL(normalizedValue);
  } catch {
    return 'Ogni immagine deve avere un URL http/https valido';
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return 'Ogni immagine deve avere un URL http/https valido';
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === 'unsplash.com' || hostname === 'www.unsplash.com') {
    return 'Il link Unsplash deve essere diretto. Usa "Copia indirizzo immagine"';
  }

  return null;
}

function validateRoomPayload(room) {
  if (!room || typeof room !== 'object') {
    return 'Dati camera non validi';
  }

  if (!isFilledString(room.nome)) {
    return 'Il nome della camera è obbligatorio';
  }

  if (!isFilledString(room.tipo)) {
    return 'Il tipo della camera è obbligatorio';
  }

  const prezzo = Number(room.prezzo);

  if (!Number.isFinite(prezzo) || prezzo <= 0) {
    return 'Il prezzo deve essere maggiore di zero';
  }

  const capienza = Number(room.capienza);

  if (!Number.isInteger(capienza) || capienza < 1) {
    return 'La capienza deve essere almeno 1';
  }

  if (room.disponibile !== undefined) {
    const disponibile = Number(room.disponibile);

    if (!Number.isInteger(disponibile) || ![0, 1].includes(disponibile)) {
      return 'La disponibilità deve essere valida';
    }
  }

  if (room.immagini_url !== undefined && !Array.isArray(room.immagini_url)) {
    return 'Le immagini della camera devono essere una lista di URL';
  }

  if (Array.isArray(room.immagini_url) && room.immagini_url.some((url) => typeof url !== 'string')) {
    return 'Ogni immagine deve essere un URL testuale';
  }

  if (room.immagine_url !== undefined && room.immagine_url !== null && typeof room.immagine_url !== 'string') {
    return 'L\'immagine principale deve essere un URL testuale';
  }

  const imageUrls = Array.isArray(room.immagini_url)
    ? room.immagini_url
    : [room.immagine_url];

  for (const imageUrl of imageUrls) {
    const imageValidationError = validateImageUrl(imageUrl);

    if (imageValidationError) {
      return imageValidationError;
    }
  }

  return null;
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
    const validationError = validateRoomPayload(req.body);

    if (validationError) {
      return res.status(400).json({ errore: validationError });
    }

    RoomModel.create(req.body, function(err) {
      if (err) return res.status(500).json({ errore: err.message });
      res.status(201).json({ messaggio: 'Camera creata con successo', id: this.lastID });
    });
  },

  update: (req, res) => {
    const validationError = validateRoomPayload(req.body);

    if (validationError) {
      return res.status(400).json({ errore: validationError });
    }

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
