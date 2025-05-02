const fs = require("fs");
const fetch = require("node-fetch");

async function extraerTextoDesdePDF(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64PDF = pdfBuffer.toString("base64");

  const response = await fetch(`https://vision.googleapis.com/v1/files:annotate?key=${process.env.GCP_VISION_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          inputConfig: {
            mimeType: "application/pdf",
            content: base64PDF
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          pages: [] // todas las páginas
        }
      ]
    }),
  });

  const data = await response.json();
  console.log("🧾 Respuesta completa de Google Vision OCR:", JSON.stringify(data, null, 2));

  if (!data.responses || !Array.isArray(data.responses)) {
    throw new Error("OCR falló: respuesta inválida de Google Vision.");
  }

  const fullText = data.responses
    .map(r => r.fullTextAnnotation?.text || "")
    .join("\n");

  return fullText;
}

module.exports = { extraerTextoDesdePDF };
