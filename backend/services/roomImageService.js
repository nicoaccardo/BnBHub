const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_DIMENSION = 1920;
const WEBP_QUALITY = 82;
const SUPPORTED_FORMATS = new Set(['jpeg', 'png', 'webp']);
const MIME_TYPE_FORMATS = new Map([
  ['image/jpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp']
]);
const GENERATED_FILENAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

function getUploadsRoot() {
  return path.resolve(process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads'));
}

function getRoomsRoot() {
  return path.join(getUploadsRoot(), 'rooms');
}

function validateRoomId(roomId) {
  const normalizedRoomId = Number(roomId);

  if (!Number.isInteger(normalizedRoomId) || normalizedRoomId < 1) {
    throw new Error('Identificativo camera non valido');
  }

  return normalizedRoomId;
}

function validateFilename(filename) {
  if (typeof filename !== 'string' || !GENERATED_FILENAME_PATTERN.test(filename)) {
    throw new Error('Nome file immagine non valido');
  }

  return filename;
}

function getRoomDirectory(roomId) {
  return path.join(getRoomsRoot(), String(validateRoomId(roomId)));
}

function getRoomImagePath(roomId, filename) {
  return path.join(getRoomDirectory(roomId), validateFilename(filename));
}

async function processUploadedImages(files = []) {
  const processedImages = [];

  for (const file of files) {
    try {
      const image = sharp(file.buffer, {
        failOn: 'error',
        limitInputPixels: MAX_INPUT_PIXELS,
        sequentialRead: true
      });
      const metadata = await image.metadata();

      if (!SUPPORTED_FORMATS.has(metadata.format)) {
        throw new Error('Formato immagine non supportato');
      }

      if (MIME_TYPE_FORMATS.get(file.mimetype) !== metadata.format) {
        throw new Error('Il contenuto del file non corrisponde al formato dichiarato');
      }

      if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_INPUT_PIXELS) {
        throw new Error('Risoluzione immagine troppo elevata');
      }

      if ((metadata.pages || 1) > 1) {
        throw new Error('Le immagini animate non sono supportate');
      }

      const buffer = await image
        .rotate()
        .resize({
          width: MAX_OUTPUT_DIMENSION,
          height: MAX_OUTPUT_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      processedImages.push({
        filename: `${crypto.randomUUID()}.webp`,
        buffer
      });
    } catch {
      const error = new Error(`Il file "${file.originalname}" non contiene un'immagine valida`);
      error.code = 'INVALID_IMAGE_CONTENT';
      throw error;
    }
  }

  return processedImages;
}

async function saveRoomImages(roomId, images) {
  if (images.length === 0) {
    return;
  }

  const roomDirectory = getRoomDirectory(roomId);
  await fs.promises.mkdir(roomDirectory, { recursive: true });
  const writtenFiles = [];
  const temporaryFiles = [];

  try {
    for (const image of images) {
      const finalPath = getRoomImagePath(roomId, image.filename);
      const temporaryPath = `${finalPath}.tmp`;

      temporaryFiles.push(temporaryPath);
      await fs.promises.writeFile(temporaryPath, image.buffer, { flag: 'wx' });
      await fs.promises.rename(temporaryPath, finalPath);
      writtenFiles.push(finalPath);
    }
  } catch (err) {
    await Promise.allSettled(
      [...writtenFiles, ...temporaryFiles].map((filePath) =>
        fs.promises.rm(filePath, { force: true })
      )
    );
    throw err;
  }
}

async function removeRoomImages(roomId, filenames) {
  const removals = filenames.map((filename) =>
    fs.promises.rm(getRoomImagePath(roomId, filename), { force: true })
  );

  await Promise.all(removals);
  await removeRoomDirectoryIfEmpty(roomId);
}

async function cleanupUnreferencedRoomImages(roomId, referencedFilenames) {
  const roomDirectory = getRoomDirectory(roomId);
  const referenced = new Set(referencedFilenames);
  let entries;

  try {
    entries = await fs.promises.readdir(roomDirectory, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }

    throw err;
  }

  const staleFilenames = entries
    .filter((entry) =>
      entry.isFile()
      && GENERATED_FILENAME_PATTERN.test(entry.name)
      && !referenced.has(entry.name)
    )
    .map((entry) => entry.name);

  await removeRoomImages(roomId, staleFilenames);
}

async function removeRoomDirectory(roomId) {
  await fs.promises.rm(getRoomDirectory(roomId), { recursive: true, force: true });
}

async function removeRoomDirectoryIfEmpty(roomId) {
  const roomDirectory = getRoomDirectory(roomId);

  try {
    const entries = await fs.promises.readdir(roomDirectory);

    if (entries.length === 0) {
      await fs.promises.rmdir(roomDirectory);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

module.exports = {
  MAX_INPUT_PIXELS,
  MAX_OUTPUT_DIMENSION,
  cleanupUnreferencedRoomImages,
  getRoomDirectory,
  getRoomImagePath,
  getUploadsRoot,
  processUploadedImages,
  removeRoomDirectory,
  removeRoomImages,
  saveRoomImages
};
