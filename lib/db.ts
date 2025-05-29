// lib/db.ts
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: {
    ca: process.env.DATABASE_SSL_CA,
  },
});

export default connection;
