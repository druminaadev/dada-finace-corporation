import prisma from '../../config/database.js';
import config from '../../config/env.js';
import smsService from '../../services/sms.service.js';
import { logger } from '../../utils/logger.js';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

class ReminderService {
  async sendUpcomingEmiReminders(days = config.sms.reminderDaysBefore) {
    const daysAhead = parseInt(days) || config.sms.reminderDaysBefore;
    const startDate = new Date(); startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysAhead);
    endDate.setHours(23, 59, 59, 999);

    const emis = await prisma.eMISchedule.findMany({
      where: { status: 'PENDING', dueDate: { gte: startDate, lte: endDate } },
      include: {
        smsReminder: true,
        loan: { include: { customer: { select: { id: true, name: true, phone: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const results = [];

    for (const emi of emis) {
      if (emi.smsReminder?.status === 'SENT') {
        results.push({ emiId: emi.id, status: 'ALREADY_SENT' });
        continue;
      }

      const customer = emi.loan.customer;
      const message = `Dear ${customer.name}, your EMI ${emi.emiNumber} of ${formatAmount(emi.amount)} is due on ${formatDate(emi.dueDate)}. Please pay on time. - Drumina Finance`;

      const reminder = await prisma.smsReminder.upsert({
        where: { emiId: emi.id },
        update: { phone: customer.phone, message, status: 'PENDING', failureReason: null },
        create: { emiId: emi.id, phone: customer.phone, message },
      });

      try {
        const smsResult = await smsService.send(customer.phone, message);
        const status = smsResult.status === 'SENT' ? 'SENT' : 'SKIPPED';
        await prisma.smsReminder.update({
          where: { id: reminder.id },
          data: { status, sentAt: status === 'SENT' ? new Date() : null, failureReason: smsResult.failureReason || null },
        });
        results.push({ emiId: emi.id, reminderId: reminder.id, status });
      } catch (error) {
        await prisma.smsReminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED', failureReason: error.message },
        });
        logger.error({ err: error, emiId: emi.id, phone: customer.phone }, 'Failed to send EMI SMS reminder');
        results.push({ emiId: emi.id, reminderId: reminder.id, status: 'FAILED', error: error.message });
      }
    }

    return { window: { startDate, endDate, daysAhead }, total: results.length, results };
  }
}

export default new ReminderService();
