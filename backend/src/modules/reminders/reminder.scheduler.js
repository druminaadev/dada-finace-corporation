import config from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import reminderService from './reminder.service.js';

let intervalId = null;

const runReminderJob = async () => {
  try {
    const result = await reminderService.sendUpcomingEmiReminders();
    logger.info({ total: result.total, daysAhead: result.window.daysAhead }, 'EMI SMS reminder job completed');
  } catch (error) {
    logger.error({ err: error }, 'EMI SMS reminder job failed');
  }
};

export const startReminderScheduler = () => {
  if (!config.sms.enabled || !config.sms.schedulerEnabled || intervalId) return;
  runReminderJob();
  const intervalMs = config.sms.schedulerIntervalMinutes * 60 * 1000;
  intervalId = setInterval(runReminderJob, intervalMs);
  logger.info({ intervalMinutes: config.sms.schedulerIntervalMinutes }, 'EMI SMS reminder scheduler started');
};

export const stopReminderScheduler = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('EMI SMS reminder scheduler stopped');
  }
};
