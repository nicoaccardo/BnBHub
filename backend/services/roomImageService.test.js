const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  cleanupUnreferencedRoomImages,
  getRoomImagePath
} = require('./roomImageService');

test('room image paths reject traversal and non-generated filenames', () => {
  assert.throws(
    () => getRoomImagePath(1, '../camera.webp'),
    /Nome file immagine non valido/
  );
  assert.throws(
    () => getRoomImagePath(1, 'camera.webp'),
    /Nome file immagine non valido/
  );
  assert.doesNotThrow(() =>
    getRoomImagePath(1, '11111111-1111-4111-8111-111111111111.webp')
  );
});

test('room image cleanup removes only unreferenced generated files', async (t) => {
  const originalUploadsPath = process.env.UPLOADS_PATH;
  const uploadsPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bnbhub-cleanup-'));
  process.env.UPLOADS_PATH = uploadsPath;
  const keptFilename = '11111111-1111-4111-8111-111111111111.webp';
  const staleFilename = '22222222-2222-4222-8222-222222222222.webp';
  const unrelatedFilename = 'note.txt';
  const roomDirectory = path.join(uploadsPath, 'rooms', '5');
  await fs.promises.mkdir(roomDirectory, { recursive: true });
  await Promise.all([
    fs.promises.writeFile(path.join(roomDirectory, keptFilename), 'kept'),
    fs.promises.writeFile(path.join(roomDirectory, staleFilename), 'stale'),
    fs.promises.writeFile(path.join(roomDirectory, unrelatedFilename), 'unrelated')
  ]);

  t.after(async () => {
    if (originalUploadsPath === undefined) {
      delete process.env.UPLOADS_PATH;
    } else {
      process.env.UPLOADS_PATH = originalUploadsPath;
    }
    await fs.promises.rm(uploadsPath, { recursive: true, force: true });
  });

  await cleanupUnreferencedRoomImages(5, [keptFilename]);

  assert.equal(fs.existsSync(path.join(roomDirectory, keptFilename)), true);
  assert.equal(fs.existsSync(path.join(roomDirectory, staleFilename)), false);
  assert.equal(fs.existsSync(path.join(roomDirectory, unrelatedFilename)), true);
});
