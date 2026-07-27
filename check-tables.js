const { Client } = require('pg');

const connectionString = "postgresql://postgres.vcyzeugbtdfnyjehyyjn:Gama123456789101112@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');
    
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    const res = await client.query(query);
    console.log('Tables in public schema:');
    console.log(res.rows.map(r => r.table_name).filter(t => t.toLowerCase().includes('log') || t.toLowerCase().includes('otp')));
  } catch (err) {
    console.error('Error fetching tables:', err);
  } finally {
    await client.end();
  }
}

run();
