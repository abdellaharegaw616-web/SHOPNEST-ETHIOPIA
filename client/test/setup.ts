import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill window.matchMedia for responsive UI components in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill global fetch for RTK Query in test environment
global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('/health')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'ShopNest Ethiopia API is operational',
        data: {
          status: 'healthy',
          uptime: 42,
          timestamp: new Date().toISOString(),
          environment: 'test',
          version: '1.0.0',
          database: { status: 'connected', name: 'shopnest_test' },
          system: { memoryUsageMB: 25, nodeVersion: process.version, platform: 'test' },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  });
}) as unknown as typeof fetch;
