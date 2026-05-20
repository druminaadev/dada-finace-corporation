const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const Logger = require('./utils/logger');

const loanApplicationRoutes = require('./modules/loan-application/loan-application.routes');
const masterRoutes = require('./modules/master/master.routes');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const loanRoutes = require('./modules/loans/loan.routes');
const emiRoutes = require('./modules/emi/emi.routes');
const guarantorRoutes = require('./modules/guarantors/guarantor.routes');
const nomineeRoutes = require('./modules/nominees/nominee.routes');
const documentRoutes = require('./modules/documents/document.routes');
const reportRoutes = require('./modules/reports/report.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/loan-application', loanApplicationRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/emi', emiRoutes);
app.use('/api/guarantors', guarantorRoutes);
app.use('/api/nominees', nomineeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

module.exports = app;
