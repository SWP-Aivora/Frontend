const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

const getUrlBase = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost';
};

const getPathFilename = (pathname: string): string | undefined => {
  const filename = pathname.split('/').pop();
  if (!filename) return undefined;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
};

export const withAttachmentFilename = (attachmentUrl: string, filename: string): string => {
  try {
    const baseUrl = getUrlBase();
    const isAbsoluteUrl = ABSOLUTE_URL_PATTERN.test(attachmentUrl);
    const isRootRelativeUrl = attachmentUrl.startsWith('/');
    const url = new URL(attachmentUrl, baseUrl);

    url.searchParams.set('filename', filename);

    if (!isAbsoluteUrl && url.origin === baseUrl) {
      const pathname = isRootRelativeUrl ? url.pathname : url.pathname.replace(/^\//, '');
      return `${pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    return attachmentUrl;
  }
};

export const getAttachmentFilename = (attachmentUrl: unknown): string | undefined => {
  if (typeof attachmentUrl !== 'string' || !attachmentUrl.trim()) return undefined;

  try {
    const url = new URL(attachmentUrl, getUrlBase());
    const queryFilename = url.searchParams.get('filename');

    if (queryFilename) return queryFilename;

    const hashFilename = new URLSearchParams(url.hash.replace(/^#/, '')).get('filename');
    if (hashFilename) return hashFilename;

    return getPathFilename(url.pathname);
  } catch {
    const filenameMatch = attachmentUrl.match(/[#&?]filename=([^&#]+)/);
    if (filenameMatch?.[1]) {
      try {
        return decodeURIComponent(filenameMatch[1]);
      } catch {
        return filenameMatch[1];
      }
    }

    return attachmentUrl.split('#')[0].split('?')[0].split('/').pop() || undefined;
  }
};
