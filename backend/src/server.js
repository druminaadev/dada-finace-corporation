import config from './config/env.js';
import app from './app.js';
import prisma from './config/database.js';
import { logger } from './utils/logger.js';
import { startReminderScheduler, stopReminderScheduler } from './modules/reminders/reminder.scheduler.js';
import { verifyEmailConnection } from './services/email.service.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
    await verifyEmailConnection();

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
      if (!config.isProduction) {
        console.log(`🚀 Server:  http://localhost:${config.port}`);
        console.log(`📋 Swagger: http://localhost:${config.port}/api-docs`);
        console.log(`❤️  Health:  http://localhost:${config.port}/health/ready`);
        console.log(`🔗 API:     http://localhost:${config.port}/api/v1`);
      }
      startReminderScheduler();
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down`);
      stopReminderScheduler();
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logger.error({ reason: String(reason) }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception — shutting down');
  process.exit(1);
});

startServer();
