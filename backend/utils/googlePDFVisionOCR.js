const fs = require("fs");
const axios = require("axios");
const { fromPath } = require("pdf2pic");

async function extraerTextoDesdePDF(pdfPath) {
  // Asegurar que exista la carpeta temporal
  const tmpDir = "./tmp";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  try {
    // Convertir la primera página del PDF a PNG
    const convert = fromPath(pdfPath, {
      density: 150,
      saveFilename: "page",
      savePath: tmpDir,
      format: "png",
      width: 600,
      height: 800,
    });

    const result = await convert(1); // primera página

    const imageBuffer = fs.readFileSync(result.path);
    const base64Image = imageBuffer.toString("base64");

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GCP_VISION_API_KEY}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }
    );

    const text = response.data.responses?.[0]?.fullTextAnnotation?.text || "";
    return text.trim();
  } catch (error) {
    console.error("❌ Error en solicitud OCR:", error.response?.data || error.message);
    throw new Error("Fallo la solicitud OCR a Google Vision");
  }
}

module.exports = { extraerTextoDesdePDF };
