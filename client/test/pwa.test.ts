import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Progressive Web App (PWA) Specifications & Compliance', () => {
  const publicDir = path.resolve(__dirname, '../public');

  it('contains valid manifest.webmanifest with standard PWA fields', () => {
    const manifestPath = path.join(publicDir, 'manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifestContent.name).toContain('ShopNest Ethiopia');
    expect(manifestContent.short_name).toBe('ShopNest ET');
    expect(manifestContent.theme_color).toBe('#F97316');
    expect(manifestContent.background_color).toBe('#FFFFFF');
    expect(manifestContent.display).toBe('standalone');
    expect(manifestContent.start_url).toBe('/');
    expect(manifestContent.scope).toBe('/');

    // Verify icons
    expect(Array.isArray(manifestContent.icons)).toBe(true);
    expect(manifestContent.icons.length).toBeGreaterThanOrEqual(3);

    const has192 = manifestContent.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifestContent.icons.some((i: any) => i.sizes === '512x512');
    const hasMaskable = manifestContent.icons.some((i: any) => i.purpose === 'maskable');

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it('provides all referenced app icon assets in public/icons', () => {
    const iconsDir = path.join(publicDir, 'icons');
    expect(fs.existsSync(iconsDir)).toBe(true);

    const expectedIcons = [
      'icon-192x192.png',
      'icon-512x512.png',
      'maskable-icon-512x512.png',
      'icon-192x192.svg',
      'icon-512x512.svg',
    ];

    for (const iconFile of expectedIcons) {
      const iconPath = path.join(iconsDir, iconFile);
      expect(fs.existsSync(iconPath)).toBe(true);
      const stat = fs.statSync(iconPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it('implements strict sensitive cache bypassing in service worker (sw.js)', () => {
    const swPath = path.join(publicDir, 'sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');

    // Rule: "Never cache sensitive user/cart/checkout data"
    expect(swContent).toContain("isSensitiveRequest");
    expect(swContent).toContain("'/api/'");
    expect(swContent).toContain("'/checkout'");
    expect(swContent).toContain("'/cart'");
    expect(swContent).toContain("'/account'");
    expect(swContent).toContain("'/admin'");

    // Verify pre-cache assets and offline fallback
    expect(swContent).toContain("'/offline.html'");
    expect(swContent).toContain("'/manifest.webmanifest'");
  });

  it('contains bilingual offline fallback page (offline.html)', () => {
    const offlinePath = path.join(publicDir, 'offline.html');
    expect(fs.existsSync(offlinePath)).toBe(true);

    const htmlContent = fs.readFileSync(offlinePath, 'utf8');
    expect(htmlContent).toContain('You are currently offline');
    expect(htmlContent).toContain('ያለበይነመረብ ግንኙነት ላይ ነዎት');
    expect(htmlContent).toContain('#F97316');
    expect(htmlContent).toContain('retryBtn');
  });

  it('links manifest and mobile web app headers in index.html', () => {
    const indexPath = path.resolve(__dirname, '../index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    expect(indexHtml).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(indexHtml).toContain('name="theme-color" content="#F97316"');
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable" content="yes"');
  });
});
