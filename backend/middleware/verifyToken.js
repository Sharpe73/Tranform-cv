const jwt = require("jsonwebtoken");
const db = require("../database");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await db.query("SELECT id FROM usuarios WHERE id = $1", [decoded.id]);

    if (userResult.rows.length === 0) {
      console.error("❌ Usuario eliminado. Cerrando sesión.");
      return res.status(401).json({ message: "usuario eliminado" });
    }

    // decoded debe contener: id, nombre, apellido, rol
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = verifyToken;
