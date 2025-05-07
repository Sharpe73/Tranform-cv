const db = require("../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT u.*, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.ADMIN_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { login };

