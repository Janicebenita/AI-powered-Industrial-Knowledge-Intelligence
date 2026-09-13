import { IntegrationError } from './config';
export async function requestJson<T>(provider: string, url: string, init: RequestInit = {}, retrySafe = true, timeout = 10000): Promise<T> {
  const attempts = retrySafe ? 3 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, { ...init, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(timeout) });
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt + 1 < attempts) { await new Promise(r => setTimeout(r, 200 * 2 ** attempt)); continue; }
        throw new IntegrationError(response.status === 401 || response.status === 403 ? 'misconfigured' : 'unavailable', `${provider} request failed (HTTP ${response.status})`);
      }
      const text = await response.text();
      if (text.length > 4_000_000) throw new IntegrationError('invalid_response', `${provider} response exceeds limit`);
      try { return JSON.parse(text) as T; } catch { throw new IntegrationError('invalid_response', `${provider} returned invalid JSON`); }
    } catch (error) {
      if (error instanceof IntegrationError) throw error;
      if (attempt + 1 === attempts) throw new IntegrationError('unavailable', `${provider} request timed out or connection failed`);
      await new Promise(r => setTimeout(r, 200 * 2 ** attempt));
    }
  }
  throw new IntegrationError('unavailable', `${provider} unavailable`);
}
