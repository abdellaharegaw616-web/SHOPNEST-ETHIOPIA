import { describe, it, expect } from 'vitest';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_CUSTOMERS,
  SEED_COUPONS,
} from '../src/scripts/seedData';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

describe('Database Seed Data Integrity & Business Verification', () => {
  it('includes at least 8 distinct product categories with English and Amharic names', () => {
    expect(SEED_CATEGORIES.length).toBeGreaterThanOrEqual(8);

    const slugs = new Set<string>();
    for (const cat of SEED_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.nameAmharic).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.image).toBeTruthy();
      expect(slugs.has(cat.slug)).toBe(false); // No duplicate slugs
      slugs.add(cat.slug);
    }
  });

  it('includes at least 30 products with valid ETB pricing, unique SKUs, and stock', () => {
    expect(SEED_PRODUCTS.length).toBeGreaterThanOrEqual(30);

    const skus = new Set<string>();
    const slugs = new Set<string>();
    const categorySlugs = new Set(SEED_CATEGORIES.map((c) => c.slug));

    for (const prod of SEED_PRODUCTS) {
      // Name & descriptions
      expect(prod.title).toBeTruthy();
      expect(prod.titleAmharic).toBeTruthy();
      expect(prod.description).toBeTruthy();
      expect(prod.descriptionAmharic).toBeTruthy();

      // Slugs and SKUs
      expect(prod.slug).toBeTruthy();
      expect(prod.sku).toBeTruthy();
      expect(slugs.has(prod.slug)).toBe(false);
      expect(skus.has(prod.sku)).toBe(false);
      slugs.add(prod.slug);
      skus.add(prod.sku);

      // ETB Pricing
      expect(prod.price).toBeGreaterThan(0);
      if (prod.discountPrice) {
        expect(prod.discountPrice).toBeLessThan(prod.price);
        expect(prod.discountPrice).toBeGreaterThan(0);
      }

      // Stock
      expect(prod.stock).toBeGreaterThanOrEqual(0);

      // Category relationship
      expect(categorySlugs.has(prod.categorySlug)).toBe(true);

      // Authorized images
      expect(prod.images.length).toBeGreaterThan(0);
      expect(prod.images[0]).toMatch(/^https:\/\/images\.unsplash\.com\//);
    }
  });

  it('contains low-stock products to trigger inventory thresholds', () => {
    const lowStockItems = SEED_PRODUCTS.filter((p) => p.stock <= 5);
    expect(lowStockItems.length).toBeGreaterThanOrEqual(2);
  });

  it('contains clearly identified demo customers with valid Ethiopian phone numbers', () => {
    expect(SEED_CUSTOMERS.length).toBeGreaterThanOrEqual(3);

    for (const customer of SEED_CUSTOMERS) {
      expect(customer.name).toContain('Demo Customer');
      expect(customer.email).toMatch(/^demo\./);
      expect(ETHIOPIA_CONSTANTS.phoneRegex.test(customer.phone)).toBe(true);
      expect(customer.address.city).toBeTruthy();
      expect(customer.address.isDefault).toBe(true);
    }
  });

  it('contains promotional coupons with discount rules', () => {
    expect(SEED_COUPONS.length).toBeGreaterThanOrEqual(2);

    for (const coupon of SEED_COUPONS) {
      expect(coupon.code).toBeTruthy();
      expect(coupon.discountValue).toBeGreaterThan(0);
      expect(coupon.expiryDaysFromNow).toBeGreaterThan(0);
      expect(coupon.usageLimit).toBeGreaterThan(0);
    }
  });
});
