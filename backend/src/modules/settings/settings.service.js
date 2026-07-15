import prisma from '../../config/database.js';
import redis from '../../config/redis.js';
import AppError from '../../utils/appError.js';

const CACHE_KEY = 'system:settings';
const CACHE_TTL = 300;

const rGet = async (key) => { try { return await redis.get(key); } catch { return null; } };
const rSet = async (key, ttl, val) => { try { await redis.setex(key, ttl, val); } catch { /* noop */ } };
const rDel = async (key) => { try { await redis.del(key); } catch { /* noop */ } };

class SettingsService {
  async getAll() {
    const cached = await rGet(CACHE_KEY);
    if (cached) return JSON.parse(cached);
    const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    await rSet(CACHE_KEY, CACHE_TTL, JSON.stringify(map));
    return map;
  }

  async get(key) {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) throw new AppError(`Setting '${key}' not found`, 404);
    return setting;
  }

  async upsert(key, value, description, updatedBy) {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, description, updatedBy },
      create: { key, value, description, updatedBy },
    });
    await rDel(CACHE_KEY);
    await prisma.auditLog.create({
      data: { userId: updatedBy, action: 'SETTING_UPDATED', entity: 'SystemSetting', entityId: key, newValues: { key, value } },
    }).catch(() => {});
    return setting;
  }

  async bulkUpsert(settings, updatedBy) {
    return Promise.all(settings.map(({ key, value, description }) => this.upsert(key, value, description, updatedBy)));
  }

  async delete(key, deletedBy) {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) throw new AppError(`Setting '${key}' not found`, 404);
    await prisma.systemSetting.delete({ where: { key } });
    await rDel(CACHE_KEY);
    await prisma.auditLog.create({
      data: { userId: deletedBy, action: 'SETTING_DELETED', entity: 'SystemSetting', entityId: key, oldValues: { key, value: setting.value } },
    }).catch(() => {});
  }
}

export default new SettingsService();
