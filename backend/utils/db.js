import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
	user: 'matcha',
	host: 'postgres-db',
	database: 'matcha',
	password: 'root',
	port: 5432,
});

(async () => {
  try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
  } catch (err) {
      console.error("error connecting to PostgreSQL:", err.message);
  }
})();

export default pool;