const express = require("express");
const router = express.Router();
const db = require("../database");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol, u.password = crypt($2, u.password) as match FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = $1",
      [email, password]
    );

    const user = result.rows[0];

    if (!user || !user.match) {
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

module.exports = router;
