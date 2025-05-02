const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const sharp = require("sharp");
const Tesseract = require("tesseract.js");
const path = require("path");

async function extraerTextoOCR(rutaPDF, pagina = 0) {
  try {
    const buffer = fs.readFileSync(rutaPDF);
    const tempImg = path.join(__dirname, `../uploads/temp_ocr.png`);

    // Convertir PDF a imagen con sharp (resolución alta para mejor OCR)
    await sharp(buffer, { density: 300 })
      .png()
      .toFile(tempImg);

    // Ejecutar OCR con Tesseract (español)
    const resultado = await Tesseract.recognize(tempImg, "spa", {
      logger: (m) => console.log(`[OCR] ${m.status} (${Math.floor(m.progress * 100)}%)`),
    });

    // Eliminar la imagen temporal
    fs.unlinkSync(tempImg);

    return resultado.data.text;
  } catch (error) {
    console.error("❌ Error al extraer texto con OCR:", error.message);
    return "";
  }
}

module.exports = { extraerTextoOCR };
