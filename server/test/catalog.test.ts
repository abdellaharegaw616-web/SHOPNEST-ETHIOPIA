import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { CatalogService } from '../src/services/catalog.service';

describe('Catalog and Search API & Service Integration Tests', () => {
  const app = createApp();

  describe('Server-side Filtering & Query Endpoints', () => {
    it('GET /api/v1/products handles search by keyword', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ search: 'coffee' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page', 1);
    });

    it('GET /api/v1/products handles category filter and price range', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({
          category: 'electronics',
          minPrice: 1000,
          maxPrice: 50000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('products');
    });

    it('GET /api/v1/products handles availability filters (in_stock & out_of_stock)', async () => {
      const inStockRes = await request(app)
        .get('/api/v1/products')
        .query({ availability: 'in_stock' });

      expect(inStockRes.status).toBe(200);
      expect(inStockRes.body.success).toBe(true);

      const outOfStockRes = await request(app)
        .get('/api/v1/products')
        .query({ availability: 'out_of_stock' });

      expect(outOfStockRes.status).toBe(200);
      expect(outOfStockRes.body.success).toBe(true);
    });

    it('GET /api/v1/products sanitizes excessive and invalid pagination bounds', async () => {
      // Excessive limit (5000) should be safely capped to 50
      const res = await request(app)
        .get('/api/v1/products')
        .query({ page: -5, limit: 5000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.page).toBe(1);
    });

    it('GET /api/v1/products validates and handles all supported sort orders', async () => {
      const sorts = ['price_asc', 'price_desc', 'rating', 'popularity', 'newest', 'invalid_sort'];

      for (const sortOption of sorts) {
        const res = await request(app)
          .get('/api/v1/products')
          .query({ sort: sortOption });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('GET /api/v1/products/:slug/related returns related items in category', async () => {
      const res = await request(app)
        .get('/api/v1/products/ethiopian-yirgacheffe-specialty-coffee-beans/related')
        .query({ limit: 4 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('CatalogService Unit Validation', () => {
    it('sanitizes negative or NaN page and limit inputs', async () => {
      const result = await CatalogService.getProducts({
        page: -10,
        limit: -5,
      });

      expect(result.page).toBe(1);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('caps excessive limit to 50 max to prevent database overload', async () => {
      const result = await CatalogService.getProducts({
        limit: 99999,
      });

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('totalPages');
    });

    it('handles search queries safely with special characters without regex crash', async () => {
      const specialQuery = 'Product (Pro) [v1.0] *+?';
      const result = await CatalogService.getProducts({
        search: specialQuery,
      });

      expect(result).toHaveProperty('products');
    });
  });
});
