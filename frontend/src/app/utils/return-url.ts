const INVALID_URL_CHARACTERS = /[\u0000-\u001F\u007F\\]/;

export function getSafeInternalReturnUrl(returnUrl: string | null, fallback: string): string {
  if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
    return fallback;
  }

  try {
    const decodedReturnUrl = decodeURIComponent(returnUrl);

    if (
      decodedReturnUrl.startsWith('//') ||
      INVALID_URL_CHARACTERS.test(returnUrl) ||
      INVALID_URL_CHARACTERS.test(decodedReturnUrl)
    ) {
      return fallback;
    }

    const parsedUrl = new URL(returnUrl, window.location.origin);

    if (parsedUrl.origin !== window.location.origin) {
      return fallback;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return fallback;
  }
}
