const db = require("../database");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Función para generar una contraseña aleatoria temporal
function generarPasswordTemporal(length = 10) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

// 🔹 Invitar a un nuevo usuario (solo admin)
async function invitarUsuario(req, res) {
  const { nombre, apellido, email, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo un administrador puede invitar usuarios." });
  }

  if (!nombre || !apellido || !email || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  try {
    // Validar rol
    const rolResult = await db.query("SELECT id FROM roles WHERE nombre = $1", [rol]);
    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe.` });
    }

    const rol_id = rolResult.rows[0].id;
    const passwordTemporal = generarPasswordTemporal();

    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol_id, temporal)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, true)`,
      [nombre, apellido, email, passwordTemporal, rol_id]
    );

    await sendEmail(email, "Invitación a la plataforma",
      `Hola ${nombre},\n\nHas sido invitado a nuestra aplicación.\n\nTu contraseña temporal es: ${passwordTemporal}\n\nPor favor inicia sesión en https://tranform-cv.vercel.app/login y cambia tu contraseña.\n\nGracias.`);

    res.status(201).json({ message: `✅ Invitación enviada a ${email}` });
  } catch (error) {
    console.error("❌ Error al invitar usuario:", error.message);

    if (error.code === "23505" && error.constraint === "usuarios_email_key") {
      return res.status(400).json({ message: "❗ El correo ya está registrado. Usa otro." });
    }

    res.status(500).json({ message: "Error interno al invitar usuario." });
  }
}

module.exports = { invitarUsuario };
