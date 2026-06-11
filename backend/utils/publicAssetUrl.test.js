const assert = require('node:assert/strict');
const test = require('node:test');
const { withPublicImageUrls } = require('./publicAssetUrl');

test('public image URLs use the request host and hide internal filenames', () => {
  const originalPublicApiUrl = process.env.PUBLIC_API_URL;
  delete process.env.PUBLIC_API_URL;

  try {
    const req = {
      protocol: 'https',
      get: () => 'api.example.test'
    };
    const room = withPublicImageUrls(req, {
      id: 4,
      immagini: [{
        id: 10,
        filename: '11111111-1111-4111-8111-111111111111.webp',
        url: '/uploads/rooms/4/11111111-1111-4111-8111-111111111111.webp',
        ordine: 0
      }]
    });

    assert.equal(
      room.immagine_url,
      'https://api.example.test/uploads/rooms/4/11111111-1111-4111-8111-111111111111.webp'
    );
    assert.deepEqual(room.immagini, [{
      id: 10,
      url: room.immagine_url,
      ordine: 0
    }]);
    assert.equal(Object.hasOwn(room.immagini[0], 'filename'), false);
  } finally {
    if (originalPublicApiUrl === undefined) {
      delete process.env.PUBLIC_API_URL;
    } else {
      process.env.PUBLIC_API_URL = originalPublicApiUrl;
    }
  }
});
