const {
  convertStructureImages,
  getStructureDirectory
} = require('../services/structureImageService');

async function main() {
  const convertedImages = await convertStructureImages();

  if (convertedImages.length === 0) {
    console.log(`Nessun PNG trovato in ${getStructureDirectory()}`);
    return;
  }

  console.log(`Immagini convertite: ${convertedImages.join(', ')}`);
}

main().catch((err) => {
  console.error('Conversione immagini struttura non riuscita:', err.message);
  process.exitCode = 1;
});
