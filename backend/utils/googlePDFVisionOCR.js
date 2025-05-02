const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { convert } = require("pdf-poppler");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function convertirPDFaPNG(pdfPath) {
  const outputBase = path.join(tempDir, "page");

  await convert(pdfPath, {
    format: "png",
    out_dir: tempDir,
    out_prefix: "page",
    page: null, // convertir todas las páginas
    scale: 300
  });

  const files = fs.readdirSync(tempDir).filter(f => f.startsWith("page") && f.endsWith(".png"));
  return files.map(filename => path.join(tempDir, filename));
}

async function enviarImagenAGoogleVision(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GCP_VISION_API_KEY}`;
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }]
      }
    ]
  };

  const response = await axios.post(url, body);
  return response.data.responses[0]?.fullTextAnnotation?.text || "";
}

async function extraerTextoDesdePDF(pdfPath) {
  console.log("📄 Convirtiendo PDF a PNG con pdf-poppler...");
  const imagenes = await convertirPDFaPNG(pdfPath);

  let textoCompleto = "";

  for (const imgPath of imagenes) {
    try {
      const texto = await enviarImagenAGoogleVision(imgPath);
      textoCompleto += texto + "\n";
    } catch (err) {
      console.error("❌ Error procesando imagen:", imgPath, err.message);
    }
  }

  return textoCompleto.trim();
}

module.exports = { extraerTextoDesdePDF };
