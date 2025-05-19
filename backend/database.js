const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createCVFilesTable = `
  CREATE TABLE IF NOT EXISTS cv_files (
    id SERIAL PRIMARY KEY,
    json_data TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
  );
`;

const createRolesTable = `
  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
  );
`;

const createUsuariosTable = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol_id INTEGER REFERENCES roles(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requiere_cambio_clave BOOLEAN DEFAULT false -- 👈 CAMPO AGREGADO
  );
`;

async function initDatabase() {
  try {
    await pool.query(createRolesTable);
    console.log("✅ Tabla 'roles' creada o verificada correctamente.");

    await pool.query(createUsuariosTable);
    console.log("✅ Tabla 'usuarios' creada o verificada correctamente.");

    await pool.query(createCVFilesTable);
    console.log("✅ Tabla 'cv_files' actualizada o verificada correctamente.");
  } catch (err) {
    console.error("❌ Error al inicializar la base de datos:", err);
  }
}

initDatabase();

module.exports = pool;
