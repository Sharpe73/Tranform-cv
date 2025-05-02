const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");

// Directorio temporal para imágenes
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function convertirPDFaImagenes(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const numPages = pdfDoc.getPageCount();
  const imagePaths = [];

  for (let i = 0; i < numPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);

    const singlePageBuffer = await newPdf.save();
    const outputImagePath = path.join(tempDir, `pagina${i + 1}.png`);

    await sharp(singlePageBuffer, { density: 150 })
      .png()
      .resize(1000, null) //
      .toFile(outputImagePath);

    imagePaths.push(outputImagePath);
  }

  return imagePaths;
}

module.exports = { convertirPDFaImagenes };
