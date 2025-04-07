const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario para producción en Railway
  },
});

// Crear la tabla si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cv_records (
    id SERIAL PRIMARY KEY,
    json_data TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ Tabla 'cv_records' verificada/creada correctamente."))
  .catch((err) => console.error("❌ Error al crear la tabla:", err));

module.exports = pool;
