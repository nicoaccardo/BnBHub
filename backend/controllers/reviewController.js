const BookingModel = require('../models/bookingModel');
const ReviewModel = require('../models/reviewModel');

const MAX_REVIEW_LENGTH = 500;
const MAX_REJECT_REASON_LENGTH = 250;
const STATI_ADMIN_RECENSIONE = new Set(['pubblicata', 'rifiutata']);

function todayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toPublicName(nome, cognome) {
  const initial = String(cognome || '').trim().charAt(0).toUpperCase();
  return initial ? `${nome} ${initial}.` : nome;
}

function parseVisibility(value) {
  if (value === true || value === 1 || value === '1') {
    return 1;
  }

  if (value === false || value === 0 || value === '0') {
    return 0;
  }

  return null;
}

const ReviewController = {

  getAll: (req, res) => {
    ReviewModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  getPublic: (req, res) => {
    ReviewModel.getPublic((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });

      res.json(rows.map((review) => ({
        id: review.id,
        nome_ospite: toPublicName(review.nome, review.cognome),
        camera_nome: review.camera_nome,
        voto: review.voto,
        testo: review.testo,
        created_at: review.created_at
      })));
    });
  },

  createForBooking: (req, res) => {
    const bookingId = Number(req.params.bookingId);
    const utenteId = req.user.id;
    const voto = Number(req.body.voto);
    const testo = String(req.body.testo || '').trim();

    if (!Number.isInteger(bookingId) || bookingId < 1) {
      return res.status(400).json({ errore: 'Prenotazione non valida' });
    }

    if (!Number.isInteger(voto) || voto < 1 || voto > 5) {
      return res.status(400).json({ errore: 'Il voto deve essere un numero da 1 a 5' });
    }

    if (!testo) {
      return res.status(400).json({ errore: 'Inserisci il testo della recensione' });
    }

    if (testo.length > MAX_REVIEW_LENGTH) {
      return res.status(400).json({ errore: `La recensione non può superare ${MAX_REVIEW_LENGTH} caratteri` });
    }

    BookingModel.getByIdForUser(bookingId, utenteId, (bookingErr, booking) => {
      if (bookingErr) return res.status(500).json({ errore: bookingErr.message });
      if (!booking) return res.status(404).json({ errore: 'Prenotazione non trovata' });
      if (booking.stato !== 'confermata') {
        return res.status(400).json({ errore: 'Puoi recensire solo prenotazioni confermate' });
      }
      if (booking.data_fine > todayLocalDate()) {
        return res.status(400).json({ errore: 'Puoi recensire solo dopo la fine del soggiorno' });
      }

      ReviewModel.getByBookingId(bookingId, (reviewErr, existingReview) => {
        if (reviewErr) return res.status(500).json({ errore: reviewErr.message });
        if (existingReview) {
          return res.status(409).json({ errore: 'Hai già inviato una recensione per questa prenotazione' });
        }

        ReviewModel.create(
          {
            booking_id: booking.id,
            utente_id: utenteId,
            camera_id: booking.camera_id,
            voto,
            testo
          },
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed: reviews.booking_id')) {
                return res.status(409).json({ errore: 'Hai già inviato una recensione per questa prenotazione' });
              }

              return res.status(500).json({ errore: err.message });
            }

            res.status(201).json({
              messaggio: 'Recensione inviata. Sarà visibile dopo l’approvazione.',
              id: this.lastID
            });
          }
        );
      });
    });
  },

  updateStato: (req, res) => {
    const { stato } = req.body;
    const motivoRifiuto = String(req.body.motivo_rifiuto || '').trim();

    if (!STATI_ADMIN_RECENSIONE.has(stato)) {
      return res.status(400).json({ errore: 'Stato recensione non valido' });
    }

    if (motivoRifiuto.length > MAX_REJECT_REASON_LENGTH) {
      return res.status(400).json({ errore: `Il motivo del rifiuto non può superare ${MAX_REJECT_REASON_LENGTH} caratteri` });
    }

    ReviewModel.getById(req.params.id, (getErr, existingReview) => {
      if (getErr) return res.status(500).json({ errore: getErr.message });
      if (!existingReview) return res.status(404).json({ errore: 'Recensione non trovata' });
      if (existingReview.stato === 'rifiutata') {
        return res.status(400).json({ errore: 'La recensione è già stata rifiutata e non può essere modificata' });
      }

      ReviewModel.updateStato(
        req.params.id,
        stato,
        stato === 'rifiutata' ? motivoRifiuto : null,
        function(err) {
          if (err) return res.status(500).json({ errore: err.message });

          res.json({
            messaggio: stato === 'pubblicata'
              ? 'Recensione pubblicata in home'
              : 'Recensione rifiutata'
          });
        }
      );
    });
  },

  updateVisibilita: (req, res) => {
    const visibile = parseVisibility(req.body.visibile);

    if (visibile === null) {
      return res.status(400).json({ errore: 'La visibilità della recensione non è valida' });
    }

    ReviewModel.updateVisibilita(req.params.id, visibile, function(err) {
      if (err) return res.status(500).json({ errore: err.message });
      if (this.changes === 0) return res.status(404).json({ errore: 'Recensione non trovata' });

      res.json({
        messaggio: visibile
          ? 'Recensione pubblicata in home'
          : 'Recensione nascosta dalla home'
      });
    });
  }

};

module.exports = ReviewController;
