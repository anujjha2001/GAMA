const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const profile = await prisma.userProfile.findFirst();
    if (!profile) {
      console.log('No user profile found.');
      return;
    }
    console.log('Testing schedule optimization for profile:', profile.id);

    // Call Context Builder logic manually
    const sleep = await prisma.sleepLog.findFirst({
      where: { profileId: profile.id },
      orderBy: { recordedAt: 'desc' }
    });
    console.log('Sleep log:', sleep);

    const health = await prisma.healthRecord.findFirst({
      where: { profileId: profile.id },
      orderBy: { recordedAt: 'desc' }
    });
    console.log('Health record:', health);

    // Run optimization
    const { ScheduleOrchestrator } = require('./src/features/schedule/schedule-orchestrator');
    const result = await ScheduleOrchestrator.optimizeSchedule(profile.id);
    console.log('Optimization success! Number of blocks:', result.blocks.length);
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
