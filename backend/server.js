require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { procesarCV } = require("./utils/procesarCV");
const db = require("./database");
const verifyToken = require("./middleware/verifyToken");
const ocrRoute = require("./routes/ocrRoute");

const app = express();
const PORT = process.env.PORT || 5000;
const LIMITE_MENSUAL = parseInt(process.env.LIMITE_MENSUAL) || 500;

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors({
  origin: "https://tranform-cv.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/ocr", ocrRoute);

const uploadsPath = path.join(__dirname, "uploads");
console.log("📂 Serviendo archivos estáticos desde:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s/g, "_");
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

app.post("/upload", verifyToken, upload.fields([{ name: "file" }, { name: "logo" }]), async (req, res) => {
  if (!req.files || !req.files["file"]) {
    return res.status(400).json({ message: "No se recibió ningún archivo." });
  }

  const inicioMes = new Date();
  inicioMes.setUTCDate(1);
  inicioMes.setUTCHours(0, 0, 0, 0);
  const finMes = new Date(inicioMes);
  finMes.setUTCMonth(finMes.getUTCMonth() + 1);

  try {
    const consumoGlobal = await db.query(
      `SELECT COUNT(*) AS total FROM cv_files WHERE created_at >= $1 AND created_at < $2`,
      [inicioMes.toISOString(), finMes.toISOString()]
    );

    const totalConsumido = parseInt(consumoGlobal.rows[0].total, 10);

    if (totalConsumido >= LIMITE_MENSUAL) {
      return res.status(403).json({
        message: `❌ Has alcanzado el límite mensual de ${LIMITE_MENSUAL} CVs procesados. Intenta nuevamente el próximo mes.`,
      });
    }

    const filePath = path.join(uploadsPath, req.files["file"][0].filename);
    const logoPath = req.files["logo"] ? path.join(uploadsPath, req.files["logo"][0].filename) : null;

    const opciones = {
      fontHeader: req.body.fontHeader || "Helvetica",
      fontParagraph: req.body.fontParagraph || "Helvetica",
      fontSize: parseInt(req.body.fontSize, 10) || 12,
      colorHeader: req.body.colorHeader || "#000000",
      colorParagraph: req.body.colorParagraph || "#000000",
      logoPath: logoPath,
      templateStyle: "tradicional",
    };

    const jsonPath = await procesarCV(filePath, opciones);
    const pdfFilename = path.basename(jsonPath.replace(".json", ".pdf"));
    const pdfPath = path.join(uploadsPath, pdfFilename);
    const pdfUrl = `uploads/${pdfFilename}`;

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const jsonData = JSON.stringify(JSON.parse(rawData));
    const pdfBuffer = fs.readFileSync(pdfPath);
    const timestamp = new Date().toISOString();

    await db.query(
      `INSERT INTO cv_files (json_data, pdf_url, pdf_data, created_at, usuario_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [jsonData, pdfUrl, pdfBuffer, timestamp, req.user.id]
    );

    console.log("✅ Datos guardados en la base de datos.");
    res.json({ message: "Archivo procesado con éxito.", pdfPath: pdfUrl });
  } catch (error) {
    console.error("❌ Error al procesar el archivo:", error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Error al procesar el archivo." });
  }
});

app.get("/styles", (req, res) => {
  const estilosPath = path.join(__dirname, "plantillas.json");

  if (!fs.existsSync(estilosPath)) {
    return res.status(500).json({ message: "⚠️ No se encontró el archivo de plantillas." });
  }

  try {
    const estilos = JSON.parse(fs.readFileSync(estilosPath, "utf-8")).plantillas;
    res.json({ plantillas: Object.keys(estilos) });
  } catch (error) {
    console.error("❌ Error cargando estilos:", error.message);
    res.status(500).json({ message: "Error al cargar estilos." });
  }
});

app.get("/cv/pdf/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT pdf_data FROM cv_files WHERE id = $1", [id]);

    if (result.rows.length === 0 || !result.rows[0].pdf_data) {
      return res.status(404).send("Archivo no encontrado");
    }

    const buffer = result.rows[0].pdf_data;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=cv_${id}.pdf`);
    res.send(buffer);
  } catch (error) {
    console.error("Error al descargar PDF:", error.message);
    res.status(500).send("Error al descargar PDF");
  }
});

app.get("/cv/list", verifyToken, async (req, res) => {
  if (!req.user?.rol || !["admin", "gerente de proyecto"].includes(req.user.rol)) {
    return res.status(403).json({ message: "Acceso denegado: solo administradores o gerentes pueden ver esta información." });
  }

  try {
    const result = await db.query(
      `SELECT cv.id, cv.json_data, cv.pdf_url, cv.created_at, u.nombre, u.apellido, r.nombre AS rol
       FROM cv_files cv
       LEFT JOIN usuarios u ON cv.usuario_id = u.id
       LEFT JOIN roles r ON u.rol_id = r.id
       ORDER BY cv.created_at DESC`
    );

    const parsed = result.rows.map((row) => ({
      id: row.id,
      json: JSON.parse(row.json_data),
      pdf_url: row.pdf_url,
      created_at: row.created_at,
      usuario:
        row.nombre && row.apellido && row.rol
          ? `${row.nombre} ${row.apellido} (${row.rol === "admin" ? "Admin" : row.rol})`
          : "Administrador Principal",
    }));

    res.json(parsed);
  } catch (error) {
    console.error("❌ Error al obtener CVs:", error.message);
    res.status(500).json({ message: "Error al obtener CVs desde la base de datos." });
  }
});


app.get("/cv/consumo", async (req, res) => {
  try {
    const inicioMes = new Date();
    inicioMes.setUTCDate(1);
    inicioMes.setUTCHours(0, 0, 0, 0);

    const finMes = new Date(inicioMes);
    finMes.setUTCMonth(finMes.getUTCMonth() + 1);

    const result = await db.query(
      `SELECT COUNT(*) AS total FROM cv_files WHERE created_at >= $1 AND created_at < $2`,
      [inicioMes.toISOString(), finMes.toISOString()]
    );

    res.json({ total: parseInt(result.rows[0].total, 10) });
  } catch (error) {
    console.error("❌ Error al obtener consumo mensual:", error.message);
    res.status(500).json({ error: "Error al obtener consumo mensual" });
  }
});

app.get("/cv/por-usuario", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         u.nombre || ' ' || u.apellido AS usuario, 
         CAST(COUNT(cv.id) AS INTEGER) AS cantidad,
         r.nombre AS rol
       FROM cv_files cv
       LEFT JOIN usuarios u ON cv.usuario_id = u.id
       LEFT JOIN roles r ON u.rol_id = r.id
       GROUP BY u.nombre, u.apellido, r.nombre
       ORDER BY cantidad DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener CVs por usuario:", error.message);
    res.status(500).json({ message: "Error al obtener CVs por usuario." });
  }
});

app.delete("/cv/eliminar/:id", verifyToken, async (req, res) => {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ mensaje: "No autorizado: solo el administrador puede eliminar CVs." });
  }

  const { id } = req.params;

  try {
    const existe = await db.query("SELECT id FROM cv_files WHERE id = $1", [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ mensaje: "El CV no existe o ya fue eliminado." });
    }

    await db.query("DELETE FROM cv_files WHERE id = $1", [id]);

    console.log(`🗑️ CV con ID ${id} eliminado correctamente`);
    res.status(200).json({ mensaje: "CV eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar CV:", error.message);
    res.status(500).json({ mensaje: "Error al eliminar el CV." });
  }
});

app.post("/admin/limpiar-cvs", verifyToken, async (req, res) => {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ mensaje: "No autorizado: solo el administrador puede borrar CVs." });
  }

  try {
    await db.query("TRUNCATE TABLE cv_files RESTART IDENTITY");
    await db.query("VACUUM FULL cv_files");
    console.log("✅ CVs eliminados correctamente por solicitud autorizada.");
    res.status(200).json({ mensaje: "Todos los CVs fueron eliminados correctamente y el espacio fue liberado." });
  } catch (error) {
    console.error("❌ Error al limpiar los CVs:", error.message);
    res.status(500).json({ mensaje: "Error al limpiar los CVs." });
  }
});

app.post("/users/admin/crear-usuario", verifyToken, async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede crear usuarios." });
  }

  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const existingUser = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "El correo ya existe en la base de datos. Por favor ingrese otro correo." });
    }

    const rolResult = await db.query("SELECT id FROM roles WHERE nombre = $1", [rol]);
    if (rolResult.rows.length === 0) {
      return res.status(400).json({ message: `El rol '${rol}' no existe.` });
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
    res.status(500).json({ message: "Error interno al crear el usuario" });
  }
});

app.put("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, rol } = req.body;

  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: solo el administrador puede actualizar usuarios." });
  }

  if (!nombre || !apellido || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios para actualizar el usuario." });
  }

  try {
    const rolResult = await db.query("SELECT id FROM roles WHERE nombre = $1", [rol]);
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

app.get("/permisos", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM permisos_por_rol");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener permisos:", error.message);
    res.status(500).json({ message: "Error al obtener permisos desde la base de datos." });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get("/auth/verificar", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token válido", usuario: req.user });
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});

