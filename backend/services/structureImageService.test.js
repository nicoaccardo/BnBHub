const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const sharp = require('sharp');
const {
  MAX_OUTPUT_DIMENSION,
  convertStructureImages
} = require('./structureImageService');

test('structure image conversion processes only known PNG files as bounded WebP images', async (t) => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bnbhub-structure-'));
  const sourcePath = path.join(directory, 'hero.png');

  t.after(() => fs.promises.rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 50
  }));

  await sharp({
    create: {
      width: 2400,
      height: 1200,
      channels: 3,
      background: '#c18c72'
    }
  })
    .png()
    .toFile(sourcePath);

  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: '#1b2e3c'
    }
  })
    .png()
    .toFile(path.join(directory, 'other.png'));

  const convertedImages = await convertStructureImages(directory);
  const outputPath = path.join(directory, 'hero.webp');
  const outputBuffer = await fs.promises.readFile(outputPath);
  const metadata = await sharp(outputBuffer).metadata();

  assert.deepEqual(convertedImages, ['hero.webp']);
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, MAX_OUTPUT_DIMENSION);
  assert.equal(metadata.height, 960);
  assert.equal(fs.existsSync(path.join(directory, 'other.webp')), false);
});
