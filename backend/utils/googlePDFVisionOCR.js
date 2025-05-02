const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const os = require("os");

async function extraerTextoDesdePDF(pdfPath) {
  try {
    console.log("📄 Leyendo y dividiendo PDF en páginas...");
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPages().length;
    const textoCompleto = [];

    for (let i = 0; i < numPages; i++) {
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
      singlePageDoc.addPage(copiedPage);

      const pdfPageBytes = await singlePageDoc.save();
      const imageBuffer = await sharp(pdfPageBytes, { density: 300 })
        .png()
        .toBuffer();

      const base64Image = imageBuffer.toString("base64");

      const visionResponse = await axios.post(
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

      const textoPagina =
        visionResponse.data.responses[0]?.fullTextAnnotation?.text || "";
      textoCompleto.push(textoPagina);
    }

    return textoCompleto.join("\n").trim();
  } catch (error) {
    console.error("❌ Error en OCR por imagen:", error.response?.data || error.message);
    throw new Error("OCR por imagen falló");
  }
}

module.exports = { extraerTextoDesdePDF };
