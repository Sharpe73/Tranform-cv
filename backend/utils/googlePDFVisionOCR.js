const fs = require("fs");
const axios = require("axios");

async function extraerTextoDesdePDF(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64PDF = pdfBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/files:annotate?key=${process.env.GCP_VISION_API_KEY}`;

  try {
    const response = await axios.post(url, {
      requests: [
        {
          inputConfig: {
            mimeType: "application/pdf",
            content: base64PDF
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          pages: []
        }
      ]
    });

    const data = response.data;
    console.log("🧾 Respuesta completa de Google Vision OCR:", JSON.stringify(data, null, 2));

    if (!data.responses || !Array.isArray(data.responses)) {
      throw new Error("OCR falló: respuesta inválida de Google Vision.");
    }

    const fullText = data.responses
      .map(r => r.fullTextAnnotation?.text || "")
      .join("\n");

    return fullText;
  } catch (error) {
    console.error("❌ Error en solicitud OCR:", error.response?.data || error.message);
    throw new Error("Fallo la solicitud OCR a Google Vision");
  }
}

module.exports = { extraerTextoDesdePDF };
