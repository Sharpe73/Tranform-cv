const express = require("express");
const router = express.Router();
const db = require("../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/verifyToken");
const { sendInvitationEmail, sendPasswordRecoveryEmail } = require("../utils/sendEmail"); // ✅ Corrección aquí


router.post("/login", async (req, res) => {
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

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const esValida = await bcrypt.compare(password, user.password);

    if (!esValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      requiereCambioClave: user.requiere_cambio_clave === true,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
});


router.post("/cambiar-clave", verifyToken, async (req, res) => {
  const { nuevaClave } = req.body;

  if (!nuevaClave) {
    return res.status(400).json({ message: "Debes ingresar una nueva clave." });
  }

  try {
    const hashedPassword = await bcrypt.hash(nuevaClave, 10);

    await db.query(
      `UPDATE usuarios SET password = $1, requiere_cambio_clave = false WHERE id = $2`,
      [hashedPassword, req.user.id]
    );

    res.status(200).json({ message: "✅ Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("❌ Error al cambiar clave:", err.message);
    res.status(500).json({ message: "Error interno al cambiar la contraseña." });
  }
});


router.post("/olvide-clave", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Debes ingresar un correo." });
  }

  try {
    const result = await db.query(
      `SELECT id, nombre FROM usuarios WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario o correo no encontrado." });
    }

    const usuario = result.rows[0];

    
    const claveTemporal = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(claveTemporal, 10);

    
    await db.query(
      `UPDATE usuarios SET password = $1, requiere_cambio_clave = true WHERE id = $2`,
      [hashedPassword, usuario.id]
    );

    
    await sendPasswordRecoveryEmail(email, usuario.nombre, claveTemporal);

    res.json({ message: "Contraseña temporal enviada al correo registrado." });
  } catch (error) {
    console.error("❌ Error al recuperar clave:", error.message);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
});


router.get("/validar", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await db.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Usuario eliminado. Sesión terminada." });
    }

    res.json({ message: "Sesión activa" });
  } catch (error) {
    console.error("❌ Error al validar token:", error.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
});

module.exports = router;
