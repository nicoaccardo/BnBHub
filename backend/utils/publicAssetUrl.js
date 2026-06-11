function getPublicApiUrl(req) {
  const configuredUrl = String(process.env.PUBLIC_API_URL || '').trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  return `${req.protocol}://${req.get('host')}`;
}

function toPublicAssetUrl(req, value) {
  if (!value || typeof value !== 'string') {
    return value || null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${getPublicApiUrl(req)}${normalizedPath}`;
}

function withPublicImageUrls(req, resource) {
  if (!resource) {
    return resource;
  }

  const immagini = Array.isArray(resource.immagini)
      ? resource.immagini.map((image) => ({
        id: image.id,
        url: toPublicAssetUrl(req, image.url),
        ordine: image.ordine
      }))
    : [];
  const immaginiUrl = immagini.length > 0
    ? immagini.map((image) => image.url)
    : (resource.immagini_url || []).map((url) => toPublicAssetUrl(req, url));

  return {
    ...resource,
    immagine_url: immaginiUrl[0] || toPublicAssetUrl(req, resource.immagine_url),
    immagini_url: immaginiUrl,
    immagini
  };
}

module.exports = {
  getPublicApiUrl,
  toPublicAssetUrl,
  withPublicImageUrls
};
