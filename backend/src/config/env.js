require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ],
  },
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    apiUrl: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'LOANAPP',
    reminderDaysBefore: parseInt(process.env.SMS_REMINDER_DAYS_BEFORE) || 1,
    schedulerEnabled: process.env.SMS_REMINDER_SCHEDULER_ENABLED !== 'false',
    schedulerIntervalMinutes: parseInt(process.env.SMS_REMINDER_INTERVAL_MINUTES) || 1440,
  },
};
