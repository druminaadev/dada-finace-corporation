import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import config from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drumina Loan Finance API',
      version: '1.0.0',
      description: 'Production-ready Loan Management System API',
      contact: { name: 'Drumina Loan Finance', email: 'support@druminafinance.com' },
    },
    servers: [
      { url: `${config.appUrl}/api/v1`, description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: { type: 'object', nullable: true },
            requestId: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
            requestId: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Loans', description: 'Loan management' },
      { name: 'EMI', description: 'EMI schedules and calculations' },
      { name: 'Collections', description: 'EMI collection and payments' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Reports', description: 'Reports and analytics' },
      { name: 'Dashboard', description: 'Dashboard summary' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Renewals', description: 'Loan renewals' },
      { name: 'Credit Scores', description: 'Credit score checks' },
      { name: 'Settings', description: 'System settings' },
      { name: 'Master', description: 'Master data (states, cities, loan types, etc.)' },
      { name: 'Branches', description: 'Branch management' },
      { name: 'Employees', description: 'Employee management' },
      { name: 'Audit Logs', description: 'Audit trail' },
    ],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const spec = swaggerJsdoc(options);
const router = Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(spec, {
  customSiteTitle: 'Drumina Loan Finance API',
  customCss: '.swagger-ui .topbar { background-color: #1a365d; }',
}));

router.get('/json', (_req, res) => res.json(spec));

export default router;
