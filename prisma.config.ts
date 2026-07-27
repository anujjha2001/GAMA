import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Clean and validate environment variables to prevent malformed database URLs in hosting environments like Vercel
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim();
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DIRECT_URL.trim();
} else if (process.env.DATABASE_URL) {
  // If DIRECT_URL is missing, default it to DATABASE_URL so Prisma doesn't crash on an empty/undefined directUrl env reference
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// Safely log the hostname/port of configured databases for deployment debugging
const logUrlDetails = (name: string, urlStr: string | undefined) => {
  if (!urlStr) {
    console.log(`[Prisma Config Check] ${name} is empty or not set.`);
    return;
  }
  try {
    const parsed = new URL(urlStr);
    console.log(`[Prisma Config Check] ${name} parsed successfully -> Host: ${parsed.hostname}, Port: ${parsed.port || 'default'}, Path: ${parsed.pathname}`);
  } catch (err: any) {
    console.error(`[Prisma Config Check] WARNING: ${name} is malformed: ${err.message}. Raw value length: ${urlStr.length}`);
  }
};

logUrlDetails('DATABASE_URL', process.env.DATABASE_URL);
logUrlDetails('DIRECT_URL', process.env.DIRECT_URL);

export default defineConfig({
  schema: './prisma/schema.prisma',
});

