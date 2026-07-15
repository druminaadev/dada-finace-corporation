import 'dotenv/config';

const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  const weak = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter(
    (k) => process.env[k] && process.env[k].length < 32
  );
  if (weak.length > 0) {
    console.error(`[FATAL] Weak secrets: ${weak.join(', ')} — use ≥32 chars`);
    process.exit(1);
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:5000',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,application/pdf'
    ).split(','),
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ap-south-1',
    bucket: process.env.S3_BUCKET || 'drumina-loan-documents',
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    presignExpiry: parseInt(process.env.S3_PRESIGN_EXPIRY_SECONDS, 10) || 3600,
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'Drumina Loan Finance <noreply@druminafinance.com>',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    apiUrl: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'DRUMINA',
    enabled: process.env.SMS_ENABLED !== 'false',
    schedulerEnabled: process.env.SMS_SCHEDULER_ENABLED === 'true',
    schedulerIntervalMinutes: parseInt(process.env.SMS_SCHEDULER_INTERVAL_MINUTES, 10) || 60,
    reminderDaysBefore: parseInt(process.env.SMS_REMINDER_DAYS_BEFORE, 10) || 3,
  },

  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || 'mock',
    apiUrl: process.env.WHATSAPP_API_URL,
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneId: process.env.WHATSAPP_PHONE_ID,
  },

  creditScore: {
    provider: process.env.CREDIT_SCORE_PROVIDER || 'mock',
    apiUrl: process.env.CREDIT_SCORE_API_URL,
    apiKey: process.env.CREDIT_SCORE_API_KEY,
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },

  lockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    durationMs: (parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) || 15) * 60 * 1000,
  },
};

export default config;
