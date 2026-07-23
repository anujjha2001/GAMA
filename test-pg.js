const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (err, res) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Tables:', res.rows.map(r => r.table_name));
  }
  pool.end();
});
