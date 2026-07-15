import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import config from './config/env.js';
import { logger } from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import { corsOptions, helmetOptions } from './middlewares/security.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import customerRoutes from './modules/customers/customer.routes.js';
import loanRoutes from './modules/loans/loan.routes.js';
import loanApplicationRoutes from './modules/loan-application/loan-application.routes.js';
import emiRoutes from './modules/emi/emi.routes.js';
import guarantorRoutes from './modules/guarantors/guarantor.routes.js';
import nomineeRoutes from './modules/nominees/nominee.routes.js';
import documentRoutes from './modules/documents/document.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import masterRoutes from './modules/master/master.routes.js';
import branchRoutes from './modules/branches/branch.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import roleRoutes from './modules/roles/role.routes.js';
import auditRoutes from './modules/audit-logs/audit.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import collectionRoutes from './modules/collections/collection.routes.js';
import renewalRoutes from './modules/renewals/renewal.routes.js';
import creditScoreRoutes from './modules/credit-scores/credit-score.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import swaggerRouter from './config/swagger.js';

const app = express();

// ── 1. Request ID ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', res.locals.requestId);
  next();
});

// ── 2. Security headers ───────────────────────────────────────────────────────
app.use(helmet(helmetOptions));

// ── 3. CORS ───────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── 4. Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ── 5. HTTP request logging ───────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res) => (res.statusCode >= 500 ? 'error' : 'info'),
    customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    autoLogging: { ignore: (req) => req.url === '/health/live' },
  })
);

// ── 6. Cookie parser ──────────────────────────────────────────────────────────
app.use(cookieParser());

// ── 7. Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 8. Global rate limiter ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => req.path.startsWith('/health'),
});
app.use('/api', globalLimiter);

// ── 9. Health endpoints ───────────────────────────────────────────────────────
app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));

app.get('/health/ready', async (_req, res) => {
  const checks = { database: 'unknown', redis: 'unknown' };
  try {
    const { default: prisma } = await import('./config/database.js');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }
  try {
    const { default: redis } = await import('./config/redis.js');
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }
  const healthy = Object.values(checks).every((v) => v === 'ok');
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ready' : 'not ready', checks });
});

// ── 10. Swagger docs ──────────────────────────────────────────────────────────
app.use('/api-docs', swaggerRouter);

// ── 11. API v1 routes ─────────────────────────────────────────────────────────
const v1 = express.Router();

v1.use('/auth', authRoutes);
v1.use('/users', userRoutes);
v1.use('/customers', customerRoutes);
v1.use('/loans', loanRoutes);
v1.use('/loan-application', loanApplicationRoutes);
v1.use('/emi', emiRoutes);
v1.use('/guarantors', guarantorRoutes);
v1.use('/nominees', nomineeRoutes);
v1.use('/documents', documentRoutes);
v1.use('/reports', reportRoutes);
v1.use('/master', masterRoutes);
v1.use('/branches', branchRoutes);
v1.use('/employees', employeeRoutes);
v1.use('/roles', roleRoutes);
v1.use('/audit-logs', auditRoutes);
v1.use('/dashboard', dashboardRoutes);
v1.use('/notifications', notificationRoutes);
v1.use('/collections', collectionRoutes);
v1.use('/renewals', renewalRoutes);
v1.use('/credit-scores', creditScoreRoutes);
v1.use('/settings', settingsRoutes);

app.use('/api/v1', v1);

// ── 12. 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestId: res.locals.requestId,
  });
});

// ── 13. Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

export default app;
