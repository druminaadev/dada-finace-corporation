const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/database');
const Logger = require('./utils/logger');
const { startReminderScheduler, stopReminderScheduler } = require('./modules/reminders/reminder.scheduler');

const startServer = async () => {
  try {
    await prisma.$connect();
    Logger.info('Database connected successfully');

    app.listen(config.port, () => {
      Logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      startReminderScheduler();
    });
  } catch (error) {
    Logger.error('Failed to start server', { error: error.message });
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  Logger.info('Shutting down gracefully...');
  stopReminderScheduler();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('Shutting down gracefully...');
  stopReminderScheduler();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
