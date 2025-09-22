import { CronJob } from 'cron';
import { prisma } from '../../../../../prisma/client';

export const cleanJwtBlacklist = new CronJob(
  process.env['JWT_CLEAN_INTERVAL'] || '* 0 * * *',
  async () => {
    console.log('Cleaning up old blacklisted jwts');
    await prisma.jwtBlacklist.deleteMany({
      where: { exp: { lt: new Date() } },
    });
  },
);
