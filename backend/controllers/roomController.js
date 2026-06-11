const RoomModel = require('../models/roomModel');
const { MAX_ROOM_IMAGES } = require('../middleware/roomUpload');
const {
  cleanupUnreferencedRoomImages,
  processUploadedImages,
  removeRoomDirectory,
  removeRoomImages,
  saveRoomImages
} = require('../services/roomImageService');
const { withPublicImageUrls } = require('../utils/publicAssetUrl');

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

function parseRoomPayload(req) {
  if (typeof req.body.camera !== 'string') {
    throw new Error('I dati della camera sono obbligatori');
  }

  let room;

  try {
    room = JSON.parse(req.body.camera);
  } catch {
    throw new Error('I dati della camera non sono validi');
  }

  if (!room || typeof room !== 'object' || Array.isArray(room)) {
    throw new Error('I dati della camera non sono validi');
  }

  return room;
}

function validateRoomPayload(room) {
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

  return null;
}

function parseKeptImageIds(room) {
  if (!Array.isArray(room.immagini_mantenute)) {
    throw new Error('La lista delle immagini mantenute non è valida');
  }

  const imageIds = room.immagini_mantenute.map(Number);

  if (imageIds.some((id) => !Number.isInteger(id) || id < 1)) {
    throw new Error('La lista delle immagini mantenute non è valida');
  }

  if (new Set(imageIds).size !== imageIds.length) {
    throw new Error('La lista delle immagini mantenute contiene duplicati');
  }

  return imageIds;
}

function getRoomById(id) {
  return new Promise((resolve, reject) => {
    RoomModel.getById(id, (err, room) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(room);
    });
  });
}

function createRoom(room, filenames) {
  return new Promise((resolve, reject) => {
    RoomModel.create(room, filenames, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this.lastID);
    });
  });
}

function updateRoom(id, room, keptImageIds, filenames) {
  return new Promise((resolve, reject) => {
    RoomModel.update(id, room, keptImageIds, filenames, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

function deleteRoom(id) {
  return new Promise((resolve, reject) => {
    RoomModel.deleteById(id, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this.changes);
    });
  });
}

function getRequestFiles(req) {
  return Array.isArray(req.files) ? req.files : [];
}

function handleControllerError(res, err, fallback) {
  if (err.code === 'INVALID_IMAGE_CONTENT') {
    return res.status(400).json({ errore: err.message });
  }

  if ([
    'I dati della camera sono obbligatori',
    'I dati della camera non sono validi',
    'La lista delle immagini mantenute non è valida',
    'La lista delle immagini mantenute contiene duplicati'
  ].includes(err.message)) {
    return res.status(400).json({ errore: err.message });
  }

  console.error(fallback, err.message);
  return res.status(500).json({ errore: fallback });
}

const RoomController = {
  getAll: (req, res) => {
    RoomModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows.map((room) => withPublicImageUrls(req, room)));
    });
  },

  getById: (req, res) => {
    RoomModel.getById(req.params.id, (err, row) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!row) return res.status(404).json({ errore: 'Camera non trovata' });
      res.json(withPublicImageUrls(req, row));
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
        return res.status(400).json({
          errore: 'La data di check-out deve essere successiva al check-in'
        });
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
      res.json(rows.map((room) => withPublicImageUrls(req, room)));
    });
  },

  create: async (req, res) => {
    try {
      const room = parseRoomPayload(req);
      const validationError = validateRoomPayload(room);

      if (validationError) {
        return res.status(400).json({ errore: validationError });
      }

      const files = getRequestFiles(req);

      if (files.length === 0) {
        return res.status(400).json({ errore: 'Seleziona almeno una foto della camera' });
      }

      const processedImages = await processUploadedImages(files);
      const roomId = await createRoom(
        room,
        processedImages.map((image) => image.filename)
      );

      try {
        await saveRoomImages(roomId, processedImages);
      } catch (storageErr) {
        await deleteRoom(roomId).catch(() => undefined);
        await removeRoomDirectory(roomId).catch(() => undefined);
        throw storageErr;
      }

      return res.status(201).json({
        messaggio: 'Camera creata con successo',
        id: roomId
      });
    } catch (err) {
      return handleControllerError(res, err, 'Errore durante la creazione della camera');
    }
  },

  update: async (req, res) => {
    const newImages = [];

    try {
      const room = parseRoomPayload(req);
      const validationError = validateRoomPayload(room);

      if (validationError) {
        return res.status(400).json({ errore: validationError });
      }

      const existingRoom = await getRoomById(req.params.id);

      if (!existingRoom) {
        return res.status(404).json({ errore: 'Camera non trovata' });
      }

      const keptImageIds = parseKeptImageIds(room);
      const existingImageIds = new Set(existingRoom.immagini.map((image) => image.id));

      if (keptImageIds.some((imageId) => !existingImageIds.has(imageId))) {
        return res.status(400).json({
          errore: 'Una delle immagini mantenute non appartiene alla camera'
        });
      }

      const files = getRequestFiles(req);
      const totalImages = keptImageIds.length + files.length;

      if (totalImages < 1) {
        return res.status(400).json({ errore: 'La camera deve avere almeno una foto' });
      }

      if (totalImages > MAX_ROOM_IMAGES) {
        return res.status(400).json({
          errore: `Puoi salvare al massimo ${MAX_ROOM_IMAGES} immagini per camera`
        });
      }

      newImages.push(...await processUploadedImages(files));
      await saveRoomImages(existingRoom.id, newImages);

      try {
        await updateRoom(
          existingRoom.id,
          room,
          keptImageIds,
          newImages.map((image) => image.filename)
        );
      } catch (databaseErr) {
        await removeRoomImages(
          existingRoom.id,
          newImages.map((image) => image.filename)
        ).catch(() => undefined);
        throw databaseErr;
      }

      const updatedRoom = await getRoomById(existingRoom.id);
      const referencedFilenames = updatedRoom.immagini.map((image) => image.filename);

      await cleanupUnreferencedRoomImages(
        existingRoom.id,
        referencedFilenames
      ).catch((cleanupErr) => {
        console.error('Errore pulizia immagini rimosse:', cleanupErr.message);
      });

      return res.json({ messaggio: 'Camera aggiornata con successo' });
    } catch (err) {
      return handleControllerError(res, err, 'Errore durante l’aggiornamento della camera');
    }
  },

  deleteById: async (req, res) => {
    try {
      const existingRoom = await getRoomById(req.params.id);

      if (!existingRoom) {
        return res.status(404).json({ errore: 'Camera non trovata' });
      }

      await deleteRoom(existingRoom.id);
      await removeRoomDirectory(existingRoom.id).catch((cleanupErr) => {
        console.error('Errore eliminazione file camera:', cleanupErr.message);
      });

      return res.json({ messaggio: 'Camera eliminata con successo' });
    } catch (err) {
      return handleControllerError(res, err, 'Errore durante l’eliminazione della camera');
    }
  }
};

module.exports = RoomController;
module.exports.parseRoomPayload = parseRoomPayload;
module.exports.validateRoomPayload = validateRoomPayload;
