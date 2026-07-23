import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to database.');
  
  const query = `
    ALTER TABLE "public"."Food" 
    ADD COLUMN IF NOT EXISTS "magnesium" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "vitaminA" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "vitaminB12" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "glycemicIndex" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "glycemicLoad" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "apiSource" TEXT,
    ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "cachedAt" TIMESTAMP WITH TIME ZONE;
  `;
  
  try {
    await client.query(query);
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

run();
