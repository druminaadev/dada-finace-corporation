const config = require('../../config/env');
const Logger = require('../../utils/logger');
const reminderService = require('./reminder.service');

let intervalId;

const runReminderJob = async () => {
  try {
    const result = await reminderService.sendUpcomingEmiReminders();
    Logger.info('EMI SMS reminder job completed', {
      total: result.total,
      daysAhead: result.window.daysAhead,
    });
  } catch (error) {
    Logger.error('EMI SMS reminder job failed', { error: error.message });
  }
};

const startReminderScheduler = () => {
  if (!config.sms.enabled || !config.sms.schedulerEnabled || intervalId) {
    return;
  }

  runReminderJob();

  const intervalMs = config.sms.schedulerIntervalMinutes * 60 * 1000;
  intervalId = setInterval(runReminderJob, intervalMs);
  Logger.info('EMI SMS reminder scheduler started', {
    intervalMinutes: config.sms.schedulerIntervalMinutes,
    daysBeforeDue: config.sms.reminderDaysBefore,
  });
};

const stopReminderScheduler = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    Logger.info('EMI SMS reminder scheduler stopped');
  }
};

module.exports = {
  startReminderScheduler,
  stopReminderScheduler,
};
