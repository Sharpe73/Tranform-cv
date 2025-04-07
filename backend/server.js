require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { procesarCV } = require("./utils/procesarCV");
const db = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta de uploads
const uploadsPath = path.join(__dirname, "uploads");
console.log("📂 Serviendo archivos estáticos desde:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

// Configuración de Multer
const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s/g, "_");
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// POST: subir archivo y procesar
app.post("/upload", upload.fields([{ name: "file" }, { name: "logo" }]), async (req, res) => {
  if (!req.files || !req.files["file"]) {
    return res.status(400).json({ message: "No se recibió ningún archivo." });
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

  try {
    const jsonPath = await procesarCV(filePath, opciones);
    const pdfFilename = path.basename(jsonPath.replace(".json", ".pdf"));
    const pdfUrl = `uploads/${pdfFilename}`;

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const jsonData = JSON.stringify(JSON.parse(rawData));
    const timestamp = new Date().toISOString();

    await db.query(
      `INSERT INTO cv_files (json_data, pdf_url, created_at) VALUES ($1, $2, $3)`,
      [jsonData, pdfUrl, timestamp]
    );

    console.log("✅ Datos guardados en la base de datos.");
    res.json({ message: "Archivo procesado con éxito.", pdfPath: pdfUrl });
  } catch (error) {
    console.error("❌ Error al procesar el archivo:", error.message);
    res.status(500).json({ message: "Error al procesar el archivo." });
  }
});

// GET: cargar estilos desde plantillas.json
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

// ✅ Nueva ruta para descargar archivos directamente
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadsPath, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath); // fuerza la descarga
  } else {
    res.status(404).send("Archivo no encontrado");
  }
});

// GET: listar registros desde cv_files
app.get("/cv/list", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, json_data, pdf_url, created_at FROM cv_files ORDER BY created_at DESC"
    );

    const parsed = result.rows.map((row) => ({
      id: row.id,
      json: JSON.parse(row.json_data),
      pdf_url: row.pdf_url,
      created_at: row.created_at,
    }));

    res.json(parsed);
  } catch (error) {
    console.error("❌ Error al obtener CVs:", error.message);
    res.status(500).json({ message: "Error al obtener CVs desde la base de datos." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
