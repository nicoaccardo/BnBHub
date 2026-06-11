const multer = require('multer');

const MAX_ROOM_IMAGES = 10;
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_ROOM_IMAGES,
    fileSize: MAX_IMAGE_FILE_SIZE,
    fieldSize: 100 * 1024,
    fields: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      const error = new Error('Sono consentite solo immagini JPEG, PNG o WebP');
      error.code = 'INVALID_IMAGE_TYPE';
      callback(error);
      return;
    }

    callback(null, true);
  }
});

function uploadRoomImages(req, res, next) {
  upload.array('immagini', MAX_ROOM_IMAGES)(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        errore: 'Ogni immagine deve avere una dimensione massima di 5 MB'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(413).json({
        errore: `Puoi caricare al massimo ${MAX_ROOM_IMAGES} immagini per camera`
      });
    }

    if (err.code === 'LIMIT_FIELD_VALUE' || err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({ errore: 'Dati della camera troppo grandi o non validi' });
    }

    if (err.code === 'INVALID_IMAGE_TYPE') {
      return res.status(400).json({ errore: err.message });
    }

    return res.status(400).json({ errore: 'Upload delle immagini non valido' });
  });
}

module.exports = {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MAX_ROOM_IMAGES,
  uploadRoomImages
};
