import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    },
  }),
  redact: {
    paths: ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'apiKey', 'aadhaar', 'pan', 'bankAccountNo'],
    censor: '[REDACTED]',
  },
});

/**
 * Log auth events for audit trail.
 * @param {string} event
 * @param {object} meta
 */
export const logAuthEvent = (event, meta = {}) => {
  const safe = { ...meta };
  if (safe.email) {
    const [local, domain] = safe.email.split('@');
    safe.email = `${local.slice(0, 2)}***@${domain}`;
  }
  logger.info({ event, ...safe }, `AUTH:${event}`);
};
