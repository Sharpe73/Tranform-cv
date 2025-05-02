const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const Tesseract = require("tesseract.js");

async function extraerTextoOCR(rutaPDF) {
  try {
    const pdfBytes = fs.readFileSync(rutaPDF);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    const textoCompleto = [];

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const viewport = { width: 1280, height: 1810 }; // tamaño estimado

      const imgPath = path.join(__dirname, `../uploads/ocr_temp_page${i}.png`);

      const pageAsPdf = await PDFDocument.create();
      const [copiedPage] = await pageAsPdf.copyPages(pdfDoc, [i]);
      pageAsPdf.addPage(copiedPage);
      const singlePagePdfBytes = await pageAsPdf.save();

      await sharp(singlePagePdfBytes)
        .resize(viewport.width)
        .flatten({ background: "#ffffff" })
        .png()
        .toFile(imgPath);

      const resultado = await Tesseract.recognize(imgPath, "spa", {
        logger: (m) =>
          console.log(`[OCR - Página ${i + 1}] ${m.status} (${Math.floor(m.progress * 100)}%)`),
      });

      textoCompleto.push(resultado.data.text);
      fs.unlinkSync(imgPath); // eliminar temporal
    }

    return textoCompleto.join("\n");
  } catch (error) {
    console.error("❌ Error al extraer texto con OCR:", error.message);
    return "";
  }
}

module.exports = { extraerTextoOCR };
