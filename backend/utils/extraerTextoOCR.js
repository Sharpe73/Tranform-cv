const fs = require("fs");
const path = require("path");
const { PdfConverter } = require("pdf-poppler");
const Tesseract = require("tesseract.js");

async function extraerTextoOCR(rutaPDF) {
  try {
    const outputImgPath = path.join(__dirname, "../uploads/ocr_page.png");

    const converter = new PdfConverter(rutaPDF);
    await converter.convertPage(1, {
      format: "png",
      out_dir: path.join(__dirname, "../uploads"),
      out_prefix: "ocr_page",
      page: 1,
    });

    const resultado = await Tesseract.recognize(outputImgPath, "spa", {
      logger: (m) => console.log(`[OCR] ${m.status} (${Math.floor(m.progress * 100)}%)`),
    });

    fs.unlinkSync(outputImgPath); // borra la imagen temporal

    return resultado.data.text;
  } catch (error) {
    console.error("❌ Error al extraer texto con OCR:", error.message);
    return "";
  }
}

module.exports = { extraerTextoOCR };
