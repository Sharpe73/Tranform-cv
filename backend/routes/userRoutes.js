const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../middleware/verifyToken");

// 🔹 Crear Usuario (admin)
router.post("/admin/crear-usuario", verifyToken, async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede crear usuarios." });
  }

  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const rolResult = await db.query(
      "SELECT id FROM roles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))",
      [rol]
    );

    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe` });
    }

    const rol_id = rolResult.rows[0].id;

    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol_id)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5)`,
      [nombre, apellido, email, password, rol_id]
    );

    res.status(201).json({ message: "✅ Usuario creado correctamente" });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error.message);

    if (error.code === "23505" && error.constraint === "usuarios_email_key") {
      return res.status(400).json({
        message: "❗ El correo ya está registrado en la base de datos. Por favor, ingrese otro correo.",
      });
    }

    res.status(500).json({ message: "Error interno al crear el usuario" });
  }
});

// 🔹 Obtener todos los usuarios
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       ORDER BY u.id ASC`
    );

    const usuarios = result.rows.map(user => ({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
    }));

    res.json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

// 🔹 Actualizar usuario
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede actualizar usuarios." });
  }

  if (!nombre || !apellido || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios para actualizar el usuario." });
  }

  try {
    const rolResult = await db.query(
      "SELECT id FROM roles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))",
      [rol]
    );

    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe.` });
    }

    const rol_id = rolResult.rows[0].id;

    await db.query(
      `UPDATE usuarios
       SET nombre = $1, apellido = $2, rol_id = $3
       WHERE id = $4`,
      [nombre, apellido, rol_id, id]
    );

    res.status(200).json({ message: "✅ Usuario actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error.message);
    res.status(500).json({ message: "Error interno al actualizar el usuario." });
  }
});

// 🔹 Eliminar usuario
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede eliminar usuarios." });
  }

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({ message: "No puedes eliminar tu propio usuario." });
  }

  try {
    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.status(200).json({ message: "✅ Usuario eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error.message);
    res.status(500).json({ message: "Error interno al eliminar el usuario." });
  }
});

// 🔹 Obtener todos los roles disponibles
router.get("/roles", verifyToken, async (req, res) => {
  try {
    const result = await db.query("SELECT nombre FROM roles ORDER BY id ASC");
    const roles = result.rows.map((row) => row.nombre);
    res.json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error.message);
    res.status(500).json({ message: "Error al obtener los roles." });
  }
});

module.exports = router;
