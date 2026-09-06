/**
 * Unified API Client Configuration
 * Supports:
 * 1. Single-origin (Vite dev server / Docker container)
 * 2. Split deployment: Frontend on Vercel + Backend on Render
 * 3. Expo / React Native mobile applications
 */

// Base URL configured via Vercel / Vite environment variables
// In production on Vercel: set VITE_API_BASE_URL=https://your-render-service.onrender.com
export const API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  ''
).replace(/\/+$/, '');

/**
 * Returns the fully qualified URL for an API route.
 * Example: apiEndpoint('/api/profiles') => 'https://api.render.com/api/profiles' (or '/api/profiles' in single-origin)
 */
export function apiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Enhanced fetch wrapper with default headers and base URL resolution
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = apiEndpoint(path);
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
