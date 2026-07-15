import nodemailer from 'nodemailer';
import { Queue, Worker } from 'bullmq';
import prisma from '../../config/database.js';
import redis from '../../config/redis.js';
import config from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// ── Email transporter ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined,
});

// ── BullMQ notification queue ─────────────────────────────────────────────────
const QUEUE_NAME = 'notifications';

let notificationQueue = null;
let notificationWorker = null;

export function getNotificationQueue() {
  if (!notificationQueue) {
    try {
      notificationQueue = new Queue(QUEUE_NAME, {
        connection: redis,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 200 },
      });
    } catch (err) {
      logger.warn({ err }, 'BullMQ queue init failed — notifications will be logged only');
      return null;
    }
  }
  return notificationQueue;
}

export function startNotificationWorker() {
  if (notificationWorker) return notificationWorker;

  notificationWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { channel, to, subject, body, templateKey, data, notificationId } = job.data;
      try {
        if (channel === 'EMAIL') await sendEmail(to, subject, body);
        else if (channel === 'SMS') await sendSms(to, body);
        else if (channel === 'WHATSAPP') await sendWhatsApp(to, body);
        // IN_APP is stored in DB only — no external dispatch needed

        if (notificationId) {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'SENT', sentAt: new Date() },
          }).catch(() => {});
        }
        logger.info({ channel, to, templateKey }, 'Notification sent');
      } catch (err) {
        logger.error({ err, channel, to }, 'Notification failed');
        if (notificationId) {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'FAILED', failureReason: err.message },
          }).catch(() => {});
        }
        throw err;
      }
    },
    { connection: redis, concurrency: 5 }
  );

  notificationWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Notification job permanently failed');
  });

  return notificationWorker;
}

// ── Channel adapters ──────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!config.email.user) {
    logger.info({ to, subject }, '[MOCK] Email would be sent');
    return;
  }
  await transporter.sendMail({ from: config.email.from, to, subject, html });
}

async function sendSms(to, message) {
  if (config.sms.provider === 'mock' || !config.sms.apiKey) {
    logger.info({ to, message }, '[MOCK] SMS would be sent');
    return;
  }
  // Generic HTTP SMS adapter — replace with provider SDK as needed
  const { default: https } = await import('https');
  const url = new URL(config.sms.apiUrl);
  url.searchParams.set('apikey', config.sms.apiKey);
  url.searchParams.set('sender', config.sms.senderId);
  url.searchParams.set('to', to);
  url.searchParams.set('message', message);
  await new Promise((resolve, reject) => {
    https.get(url.toString(), (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    }).on('error', reject);
  });
}

async function sendWhatsApp(to, message) {
  if (config.whatsapp.provider === 'mock' || !config.whatsapp.apiKey) {
    logger.info({ to, message }, '[MOCK] WhatsApp would be sent');
    return;
  }
  // Meta Cloud API adapter
  const { default: https } = await import('https');
  const payload = JSON.stringify({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  });
  await new Promise((resolve, reject) => {
    const req = https.request(
      `https://graph.facebook.com/v18.0/${config.whatsapp.phoneId}/messages`,
      { method: 'POST', headers: { Authorization: `Bearer ${config.whatsapp.apiKey}`, 'Content-Type': 'application/json' } },
      (res) => { res.on('data', () => {}); res.on('end', resolve); }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Template renderer ─────────────────────────────────────────────────────────

const TEMPLATES = {
  LOAN_SUBMITTED: {
    email: { subject: 'Loan Application Submitted — {{loanNo}}', body: '<p>Dear {{name}}, your loan application <b>{{loanNo}}</b> has been submitted successfully.</p>' },
    sms: 'Dear {{name}}, your loan {{loanNo}} has been submitted. Drumina Finance.',
  },
  LOAN_APPROVED: {
    email: { subject: 'Loan Approved — {{loanNo}}', body: '<p>Dear {{name}}, your loan <b>{{loanNo}}</b> of ₹{{amount}} has been approved.</p>' },
    sms: 'Dear {{name}}, your loan {{loanNo}} of Rs.{{amount}} is APPROVED. Drumina Finance.',
  },
  LOAN_REJECTED: {
    email: { subject: 'Loan Application Update — {{loanNo}}', body: '<p>Dear {{name}}, your loan <b>{{loanNo}}</b> was not approved. Reason: {{reason}}.</p>' },
    sms: 'Dear {{name}}, loan {{loanNo}} was not approved. Reason: {{reason}}. Drumina Finance.',
  },
  LOAN_DISBURSED: {
    email: { subject: 'Loan Disbursed — {{loanNo}}', body: '<p>Dear {{name}}, ₹{{amount}} has been disbursed for loan <b>{{loanNo}}</b>.</p>' },
    sms: 'Dear {{name}}, Rs.{{amount}} disbursed for loan {{loanNo}}. Drumina Finance.',
  },
  EMI_REMINDER: {
    email: { subject: 'EMI Due Reminder — {{loanNo}}', body: '<p>Dear {{name}}, your EMI of ₹{{emiAmount}} for loan <b>{{loanNo}}</b> is due on {{dueDate}}.</p>' },
    sms: 'Dear {{name}}, EMI Rs.{{emiAmount}} for loan {{loanNo}} due on {{dueDate}}. Drumina Finance.',
  },
  EMI_OVERDUE: {
    email: { subject: 'EMI Overdue — {{loanNo}}', body: '<p>Dear {{name}}, your EMI of ₹{{emiAmount}} for loan <b>{{loanNo}}</b> is overdue since {{dueDate}}. Please pay immediately.</p>' },
    sms: 'URGENT: Dear {{name}}, EMI Rs.{{emiAmount}} for loan {{loanNo}} is OVERDUE since {{dueDate}}. Drumina Finance.',
  },
  PAYMENT_RECEIVED: {
    email: { subject: 'Payment Received — Receipt {{receiptNo}}', body: '<p>Dear {{name}}, we received ₹{{amount}} for loan <b>{{loanNo}}</b>. Receipt: {{receiptNo}}.</p>' },
    sms: 'Dear {{name}}, Rs.{{amount}} received for loan {{loanNo}}. Receipt: {{receiptNo}}. Drumina Finance.',
  },
  LOAN_COMPLETED: {
    email: { subject: 'Loan Completed — {{loanNo}}', body: '<p>Dear {{name}}, congratulations! Your loan <b>{{loanNo}}</b> has been fully repaid.</p>' },
    sms: 'Congratulations {{name}}! Loan {{loanNo}} fully repaid. Drumina Finance.',
  },
};

function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}

// ── Public API ────────────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Queue a notification for delivery.
   * @param {object} opts
   * @param {string} opts.templateKey - Key from TEMPLATES
   * @param {object} opts.data - Template variables
   * @param {string} opts.userId - Recipient user/customer ID (for in-app)
   * @param {string} opts.email
   * @param {string} opts.phone
   * @param {string[]} opts.channels - ['EMAIL','SMS','WHATSAPP','IN_APP']
   */
  async send({ templateKey, data, userId, email, phone, channels = ['EMAIL', 'SMS'] }) {
    const tpl = TEMPLATES[templateKey];
    if (!tpl) {
      logger.warn({ templateKey }, 'Unknown notification template');
      return;
    }

    const queue = getNotificationQueue();
    if (!queue) {
      logger.info({ templateKey, channels }, '[MOCK] Notification queued (Redis unavailable)');
      return;
    }
    const jobs = [];

    for (const channel of channels) {
      let subject = null;
      let body = null;
      let to = null;

      if (channel === 'EMAIL' && tpl.email && email) {
        subject = renderTemplate(tpl.email.subject, data);
        body = renderTemplate(tpl.email.body, data);
        to = email;
      } else if ((channel === 'SMS' || channel === 'WHATSAPP') && tpl.sms && phone) {
        body = renderTemplate(tpl.sms, data);
        to = phone;
      } else if (channel === 'IN_APP' && userId) {
        body = tpl.sms ? renderTemplate(tpl.sms, data) : templateKey;
        to = userId;
      } else {
        continue;
      }

      // Persist notification record
      let notificationId = null;
      try {
        const record = await prisma.notification.create({
          data: {
            userId: channel === 'IN_APP' ? userId : null,
            channel,
            templateKey,
            recipient: to,
            subject,
            body,
            status: 'PENDING',
            metadata: data,
          },
        });
        notificationId = record.id;
      } catch {
        // Non-fatal — still queue the job
      }

      jobs.push(queue.add(templateKey, { channel, to, subject, body, templateKey, data, notificationId }));
    }

    await Promise.allSettled(jobs);
  }

  /** List notifications (in-app) for a user */
  async listForUser(userId, query) {
    const { skip, take } = { skip: parseInt(query.page || 1, 10) * parseInt(query.limit || 20, 10) - parseInt(query.limit || 20, 10), take: parseInt(query.limit || 20, 10) };
    const where = { userId, channel: 'IN_APP' };
    if (query.unread === 'true') where.readAt = null;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { notifications, total };
  }

  /** Mark notification as read */
  async markRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  /** Mark all in-app notifications as read */
  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, channel: 'IN_APP', readAt: null },
      data: { readAt: new Date() },
    });
  }

  /** Admin: list all notifications with filters */
  async listAll(query) {
    const where = {};
    if (query.channel) where.channel = query.channel;
    if (query.status) where.status = query.status;
    if (query.templateKey) where.templateKey = query.templateKey;
    const skip = (parseInt(query.page || 1, 10) - 1) * parseInt(query.limit || 20, 10);
    const take = parseInt(query.limit || 20, 10);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { notifications, total };
  }
}

export default new NotificationService();
