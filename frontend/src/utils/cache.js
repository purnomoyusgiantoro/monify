const CACHE_PREFIX = 'monify_cache_';
const TTL_SECONDS = 5;

export function setCache(key, data) {
  try {
    const payload = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to set cache', error);
  }
}

export function getCache(key) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    const now = Date.now();
    const ageSeconds = (now - payload.timestamp) / 1000;

    if (ageSeconds > TTL_SECONDS) {
      // Cache expired
      return null;
    }

    return payload.data;
  } catch (error) {
    return null;
  }
}

export function clearCache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (error) {
    console.error('Failed to clear cache', error);
  }
}
