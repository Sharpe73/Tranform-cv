const express = require("express");
const router = express.Router();
const db = require("../database");

// PUT /permisos/actualizar
router.put("/actualizar", async (req, res) => {
  const { rol, permisos } = req.body;

  if (!rol || !permisos) {
    return res.status(400).json({ message: "Rol y permisos son requeridos" });
  }

  try {
    await db.query(
      `UPDATE permisos_por_rol
       SET acceso_dashboard = $1,
           acceso_cvs = $2,
           acceso_repositorios = $3,
           acceso_ajustes = $4
       WHERE LOWER(rol) = LOWER($5)`,
      [
        permisos.acceso_dashboard,
        permisos.acceso_cvs,
        permisos.acceso_repositorios,
        permisos.acceso_ajustes,
        rol
      ]
    );

    res.status(200).json({ message: "Permisos actualizados correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar permisos:", error.message);
    res.status(500).json({ message: "Error interno al actualizar permisos" });
  }
});

module.exports = router;
