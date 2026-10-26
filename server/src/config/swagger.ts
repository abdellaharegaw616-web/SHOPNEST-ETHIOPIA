import { BRAND } from '@shopnest/shared';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: `${BRAND.name} REST API Specification`,
    version: '1.0.0',
    description: `Production-ready backend API for ${BRAND.name} ("${BRAND.tagline}" / "${BRAND.amharicTagline}"). Supports Ethiopian Birr (ETB), Telebirr, CBE Birr, Chapa, localized addresses, and JWT refresh token rotation.`,
    contact: {
      name: 'ShopNest Ethiopia Engineering',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Default API gateway',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'shopnest_access_token',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          timestamp: { type: 'string', example: '2026-10-23T19:00:00.000Z' },
        },
      },
      HealthData: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'healthy' },
          uptime: { type: 'number', example: 124 },
          environment: { type: 'string', example: 'development' },
          version: { type: 'string', example: '1.0.0' },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'connected' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a0123bcf418' },
          name: { type: 'string', example: 'Abebe Kebede' },
          email: { type: 'string', example: 'abebe@example.com' },
          phone: { type: 'string', example: '+251911223344' },
          role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
          isVerified: { type: 'boolean', example: true },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'Premium Ethiopian Yirgacheffe Coffee' },
          titleAmharic: { type: 'string', example: 'ፕሪሚየም ይርጋጨፌ ቡና' },
          slug: { type: 'string', example: 'premium-ethiopian-yirgacheffe-coffee' },
          price: { type: 'number', description: 'Price in Ethiopian Birr (ETB)', example: 850 },
          discountPrice: { type: 'number', example: 750 },
          stock: { type: 'number', example: 50 },
          sku: { type: 'string', example: 'COF-YIRG-500G' },
          rating: { type: 'number', example: 4.8 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health and database connectivity diagnostics',
        responses: {
          '200': {
            description: 'API and database health metrics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/v1/auth/register': {
      post: {
        summary: 'Register a new customer account with Ethiopian phone validation',
        responses: {
          '201': { description: 'Account registered and tokens issued' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/v1/auth/login': {
      post: {
        summary: 'Sign in with email and password, issuing access & rotated refresh token',
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/v1/auth/me': {
      get: {
        summary: 'Get current user profile (Requires Bearer token or session cookie)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/v1/products': {
      get: {
        summary: 'List published products with search, pagination, and ETB price filters',
        responses: {
          '200': { description: 'Paginated product list' },
        },
      },
    },
    '/v1/cart': {
      get: {
        summary: 'Get active shopping cart for user or guest session',
        responses: {
          '200': { description: 'Cart contents' },
        },
      },
    },
    '/v1/orders': {
      post: {
        summary: 'Place new order supporting Telebirr, CBE Birr, Chapa, and Cash on Delivery',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '201': { description: 'Order created' },
          '400': { description: 'Empty cart or insufficient stock' },
        },
      },
    },
    '/v1/admin/stats': {
      get: {
        summary: 'Admin e-commerce dashboard analytics and low stock alerts',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Dashboard metrics' },
          '403': { description: 'Admin permission required' },
        },
      },
    },
  },
};
