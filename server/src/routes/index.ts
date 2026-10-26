import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import healthRoutes from './health.routes';
import v1Routes from './v1.routes';

const router = Router();

// Swagger Documentation endpoint: /api/docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Top-level Health check: /api/health
router.use('/health', healthRoutes);

// Versioned API: /api/v1
router.use('/v1', v1Routes);

export default router;
