const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Crear tabla correcta si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cv_files (
    id SERIAL PRIMARY KEY,
    json_data TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ Tabla 'cv_files' verificada o creada correctamente."))
  .catch((err) => console.error("❌ Error al crear tabla:", err));

module.exports = pool;
