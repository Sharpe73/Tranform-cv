const db = require("../database");
const bcrypt = require("bcrypt");
const { sendInvitationEmail } = require("../utils/sendEmail");

// 🔹 INVITAR USUARIO
async function invitarUsuario(req, res) {
  const { nombre, apellido, email, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Solo el administrador puede invitar usuarios." });
  }

  if (!nombre || !apellido || !email || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Verificar si el rol existe
    const rolResult = await db.query(
      "SELECT id FROM roles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))",
      [rol]
    );

    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe.` });
    }

    const rol_id = rolResult.rows[0].id;

    // Generar clave temporal y encriptarla
    const claveTemporal = Math.random().toString(36).slice(-8);
    const claveHasheada = await bcrypt.hash(claveTemporal, 10);

    // Insertar usuario con clave temporal y requiere_cambio_clave=true
    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol_id, requiere_cambio_clave)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [nombre, apellido, email, claveHasheada, rol_id]
    );

    // Enviar correo
    await sendInvitationEmail(email, nombre, claveTemporal);

    res.status(200).json({ message: "✅ Invitación enviada correctamente." });
  } catch (error) {
    console.error("❌ Error al invitar usuario:", error.message);

    if (error.code === "23505" && error.constraint === "usuarios_email_key") {
      return res.status(400).json({
        message: "❗ El correo ya está registrado en la base de datos. Por favor, ingrese otro.",
      });
    }

    res.status(500).json({ message: "Error interno al invitar usuario." });
  }
}

module.exports = {
  invitarUsuario,
};
