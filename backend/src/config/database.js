import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }]
      : [{ emit: 'event', level: 'error' }],
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log(`[Prisma] ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  console.error('[Prisma Error]', e.target);
});

export default prisma;
