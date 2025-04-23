const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contiene id, nombre, apellido, rol
    next();
  } catch (error) {
    console.error("❌ Token inválido:", error.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = verifyToken;
