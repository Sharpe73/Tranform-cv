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
    req.user = decoded; // contiene id, nombre, apellido, rol

    const userResult = await db.query("SELECT id FROM usuarios WHERE id = $1", [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Usuario eliminado, sesión terminada." });
    }

    next();
  } catch (error) {
    console.error("❌ Token inválido:", error.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = verifyToken;
