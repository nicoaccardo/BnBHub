const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { getUploadsRoot } = require('./roomImageService');

const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_DIMENSION = 1920;
const WEBP_QUALITY = 82;
const STRUCTURE_IMAGE_NAMES = Object.freeze([
  'hero',
  'cucina',
  'parcheggio',
  'piscina',
  'sala-colazione',
  'salotto'
]);

function getStructureDirectory() {
  return path.join(getUploadsRoot(), 'structure');
}

async function convertStructureImages(directory = getStructureDirectory()) {
  const convertedImages = [];

  await fs.promises.mkdir(directory, { recursive: true });

  for (const imageName of STRUCTURE_IMAGE_NAMES) {
    const sourcePath = path.join(directory, `${imageName}.png`);
    const destinationPath = path.join(directory, `${imageName}.webp`);

    try {
      await fs.promises.access(sourcePath, fs.constants.R_OK);
    } catch (err) {
      if (err.code === 'ENOENT') {
        continue;
      }

      throw err;
    }

    const outputBuffer = await sharp(sourcePath, {
      failOn: 'error',
      limitInputPixels: MAX_INPUT_PIXELS,
      sequentialRead: true
    })
      .rotate()
      .resize({
        width: MAX_OUTPUT_DIMENSION,
        height: MAX_OUTPUT_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    await fs.promises.writeFile(destinationPath, outputBuffer);
    convertedImages.push(`${imageName}.webp`);
  }

  return convertedImages;
}

module.exports = {
  MAX_OUTPUT_DIMENSION,
  STRUCTURE_IMAGE_NAMES,
  WEBP_QUALITY,
  convertStructureImages,
  getStructureDirectory
};
