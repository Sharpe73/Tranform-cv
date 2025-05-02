const fs = require("fs");
const axios = require("axios");

async function extraerTextoDesdePDF(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64PDF = pdfBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/files:annotate?key=${process.env.GCP_VISION_API_KEY}`;
  const body = {
    requests: [
      {
        inputConfig: {
          content: base64PDF,
          mimeType: "application/pdf",
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        pages: []  // todas las páginas
      }
    ]
  };

  const response = await axios.post(url, body);
  const fullText = response.data.responses
    .map(r => r.fullTextAnnotation?.text || "")
    .join("\n");

  return fullText;
}

module.exports = { extraerTextoDesdePDF };
