const fs = require("fs");
const axios = require("axios");

async function extraerTextoDesdePDF(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64PDF = pdfBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/files:annotate?key=${process.env.GCP_VISION_API_KEY}`;
  const requestBody = {
    requests: [
      {
        inputConfig: {
          mimeType: "application/pdf",
          content: base64PDF
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        pages: [] // Todas las páginas
      }
    ]
  };

  try {
    const response = await axios.post(url, requestBody);
    const data = response.data;

    if (!data.responses || !Array.isArray(data.responses)) {
      throw new Error("Respuesta inválida de Google Vision.");
    }

    const textoExtraido = data.responses
      .map(r => r.fullTextAnnotation?.text || "")
      .join("\n");

    return textoExtraido.trim();
  } catch (error) {
    console.error("❌ Error en OCR de PDF:", error.response?.data || error.message);
    throw new Error("OCR no pudo extraer texto del archivo PDF");
  }
}

module.exports = { extraerTextoDesdePDF };
