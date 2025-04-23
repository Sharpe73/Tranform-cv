const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../middleware/verifyToken");

// Crear usuario solo si es admin
router.post("/admin/crear-usuario", verifyToken, async (req, res) => {
  const { nombre, apellido, email, contraseña, rol } = req.body;

  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede crear usuarios." });
  }

  if (!nombre || !apellido || !email || !contraseña || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Obtener el ID del rol
    const rolResult = await db.query("SELECT id FROM roles WHERE nombre = $1", [rol]);

    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe` });
    }

    const rol_id = rolResult.rows[0].id;

    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol_id)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5)`,
      [nombre, apellido, email, contraseña, rol_id]
    );

    res.status(201).json({ message: "✅ Usuario creado correctamente" });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error.message);
    res.status(500).json({ message: "Error interno al crear el usuario" });
  }
});

module.exports = router;
