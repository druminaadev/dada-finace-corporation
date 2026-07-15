import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import config from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// ── Provider adapters ─────────────────────────────────────────────────────────

const providers = {
  mock: {
    async fetchScore(pan, name) {
      // Deterministic mock score based on PAN hash
      const seed = pan.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const score = 550 + (seed % 300); // 550–849
      return {
        score,
        bureau: 'MOCK_BUREAU',
        reportId: `MOCK-${Date.now()}`,
        reportDate: new Date().toISOString(),
        summary: { accounts: 3, activeAccounts: 1, overdueAccounts: 0 },
        // Raw report intentionally minimal — never store full bureau report
      };
    },
  },
};

function getProvider() {
  const name = config.creditScore.provider || 'mock';
  const provider = providers[name];
  if (!provider) {
    logger.warn({ provider: name }, 'Unknown credit score provider, falling back to mock');
    return providers.mock;
  }
  return provider;
}

// ── Service ───────────────────────────────────────────────────────────────────

class CreditScoreService {
  /**
   * Request a credit score check for a customer.
   * Requires customer consent.
   */
  async requestScore(customerId, requestedBy, consentGiven) {
    if (!consentGiven) throw new AppError('Customer consent is required for credit score check', 400);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, pan: true, phone: true },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    if (!customer.pan) throw new AppError('Customer PAN is required for credit score check', 400);

    const provider = getProvider();
    let scoreData = null;
    let errorMessage = null;
    let status = 'SUCCESS';

    try {
      scoreData = await provider.fetchScore(customer.pan, customer.name);
    } catch (err) {
      errorMessage = err.message;
      status = 'FAILED';
      logger.error({ err, customerId }, 'Credit score fetch failed');
    }

    const record = await prisma.creditScoreRequest.create({
      data: {
        customerId,
        requestedBy,
        provider: config.creditScore.provider || 'mock',
        consentGiven: true,
        consentAt: new Date(),
        status,
        score: scoreData?.score ?? null,
        bureau: scoreData?.bureau ?? null,
        reportId: scoreData?.reportId ?? null,
        reportDate: scoreData?.reportDate ? new Date(scoreData.reportDate) : null,
        // Store only summary — never full bureau report
        reportSummary: scoreData?.summary ?? null,
        errorMessage,
      },
    });

    // Update customer civil score
    if (scoreData?.score) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { civilScore: scoreData.score, civilScoreDate: new Date() },
      });
    }

    return {
      id: record.id,
      score: record.score,
      bureau: record.bureau,
      status: record.status,
      reportDate: record.reportDate,
      summary: record.reportSummary,
    };
  }

  /** Get score history for a customer */
  async getHistory(customerId) {
    const records = await prisma.creditScoreRequest.findMany({
      where: { customerId },
      select: {
        id: true, score: true, bureau: true, status: true, reportDate: true,
        reportSummary: true, provider: true, createdAt: true,
        requester: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records;
  }

  /** Get latest score for a customer */
  async getLatest(customerId) {
    const record = await prisma.creditScoreRequest.findFirst({
      where: { customerId, status: 'SUCCESS' },
      select: { id: true, score: true, bureau: true, reportDate: true, reportSummary: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return record;
  }
}

export default new CreditScoreService();
