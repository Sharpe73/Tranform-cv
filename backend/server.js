require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { procesarCV } = require("./utils/procesarCV");
const db = require("./database"); // <-- conexión a PostgreSQL

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'uploads'
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

// Ruta principal: subir y transformar CV
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
    templateStyle: "tradicional", // forzado
  };

  try {
    const jsonPath = await procesarCV(filePath, opciones);
    const pdfFilename = path.basename(jsonPath.replace(".json", ".pdf"));
    const pdfUrl = `uploads/${pdfFilename}`;

    // Leer JSON generado
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString();

    // Insertar en la base de datos PostgreSQL
    await db.query(
      `INSERT INTO cv_records (json_data, pdf_url, file_name, created_at) VALUES ($1, $2, $3, $4)`,
      [jsonData, pdfUrl, fileName, timestamp]
    );

    console.log("✅ Datos guardados en la base de datos.");

    res.json({ message: "Archivo procesado con éxito.", pdfPath: pdfUrl });
  } catch (error) {
    console.error("❌ Error al procesar el archivo:", error.message);
    res.status(500).json({ message: "Error al procesar el archivo." });
  }
});

// Ruta para cargar estilos desde plantillas.json
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

// 🔍 Ruta para listar todos los CVs procesados
app.get("/cv/list", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, file_name, pdf_url, created_at FROM cv_records ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener CVs:", error.message);
    res.status(500).json({ message: "Error al obtener CVs desde la base de datos." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
