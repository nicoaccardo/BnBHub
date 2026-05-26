const BookingModel = require('../models/bookingModel');
const RoomModel = require('../models/roomModel');
const { sendBookingConfirmedEmail } = require('../services/mailService');

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

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
    const { camera_id, data_inizio, data_fine } = req.body;
    const cameraId = Number(camera_id);
    const utente_id = req.user.id;

    if (!Number.isInteger(cameraId) || cameraId < 1) {
      return res.status(400).json({ errore: 'Camera non valida' });
    }

    if (!isValidDate(data_inizio) || !isValidDate(data_fine)) {
      return res.status(400).json({ errore: 'Inserisci date valide nel formato YYYY-MM-DD' });
    }

    if (data_fine <= data_inizio) {
      return res.status(400).json({ errore: 'La data di check-out deve essere successiva al check-in' });
    }

    RoomModel.getById(cameraId, (roomErr, room) => {
      if (roomErr) return res.status(500).json({ errore: roomErr.message });
      if (!room) return res.status(404).json({ errore: 'Camera non trovata' });
      if (!room.disponibile) return res.status(400).json({ errore: 'Camera non disponibile' });

      BookingModel.hasOverlap(cameraId, data_inizio, data_fine, (overlapErr, overlap) => {
        if (overlapErr) return res.status(500).json({ errore: overlapErr.message });
        if (overlap) return res.status(409).json({ errore: 'La camera non e disponibile nel periodo selezionato' });

        BookingModel.create(
          { utente_id, camera_id: cameraId, data_inizio, data_fine, stato: 'in attesa' },
          function(err) {
            if (err) return res.status(500).json({ errore: err.message });
            res.status(201).json({ messaggio: 'Prenotazione creata con successo', id: this.lastID });
          }
        );
      });
    });
  },

  updateStato: (req, res) => {
    const { stato } = req.body;

    BookingModel.getById(req.params.id, (getErr, existingBooking) => {
      if (getErr) return res.status(500).json({ errore: getErr.message });
      if (!existingBooking) return res.status(404).json({ errore: 'Prenotazione non trovata' });

      BookingModel.updateStato(req.params.id, stato, (err) => {
        if (err) return res.status(500).json({ errore: err.message });

        if (stato === 'confermata' && existingBooking.stato !== 'confermata') {
          BookingModel.getDetailedById(req.params.id, (detailErr, booking) => {
            if (detailErr) {
              console.error('Errore recupero dettagli prenotazione per email:', detailErr.message);
              return;
            }

            if (!booking) {
              console.error('Prenotazione confermata non trovata per email:', req.params.id);
              return;
            }

            sendBookingConfirmedEmail(booking).catch((mailErr) => {
              console.error('Errore invio email prenotazione confermata:', mailErr.message);
            });
          });
        }

        res.json({ messaggio: 'Stato prenotazione aggiornato' });
      });
    });
  },

  updateGuestInfo: (req, res) => {
    const { intolleranze = '', note_ospite = '' } = req.body;
    const bookingId = req.params.id;
    const utenteId = req.user.id;

    BookingModel.getByIdForUser(bookingId, utenteId, (getErr, booking) => {
      if (getErr) return res.status(500).json({ errore: getErr.message });
      if (!booking) return res.status(404).json({ errore: 'Prenotazione non trovata' });
      if (booking.stato === 'cancellata') {
        return res.status(400).json({ errore: 'Non puoi modificare una prenotazione cancellata' });
      }

      BookingModel.updateGuestInfo(
        bookingId,
        utenteId,
        {
          intolleranze: String(intolleranze).trim(),
          note_ospite: String(note_ospite).trim()
        },
        (err) => {
          if (err) return res.status(500).json({ errore: err.message });
          res.json({ messaggio: 'Informazioni soggiorno aggiornate' });
        }
      );
    });
  },

  cancelMine: (req, res) => {
    const bookingId = req.params.id;
    const utenteId = req.user.id;

    BookingModel.getByIdForUser(bookingId, utenteId, (getErr, booking) => {
      if (getErr) return res.status(500).json({ errore: getErr.message });
      if (!booking) return res.status(404).json({ errore: 'Prenotazione non trovata' });
      if (booking.stato === 'cancellata') {
        return res.status(400).json({ errore: 'Prenotazione gia cancellata' });
      }

      BookingModel.cancelByUser(bookingId, utenteId, function(err) {
        if (err) return res.status(500).json({ errore: err.message });
        if (this.changes === 0) {
          return res.status(400).json({ errore: 'Prenotazione non annullabile' });
        }

        res.json({ messaggio: 'Prenotazione annullata' });
      });
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
