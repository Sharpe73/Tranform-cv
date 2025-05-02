const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const axios = require("axios");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function pdfToImages(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();

  const imagePaths = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    const singlePagePdf = await newPdf.save();

    const imagePath = path.join(tempDir, `page_${i + 1}.png`);
    const pngBuffer = await sharp(singlePagePdf, { density: 300 })
      .resize(1200)
      .png()
      .toBuffer();

    fs.writeFileSync(imagePath, pngBuffer);
    imagePaths.push(imagePath);
  }

  return imagePaths;
}

async function enviarImagenAGoogleVision(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GCP_VISION_API_KEY}`;
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }]
      }
    ]
  };

  const response = await axios.post(url, body);
  return response.data.responses[0]?.fullTextAnnotation?.text || "";
}

async function extraerTextoDesdePDF(pdfPath) {
  const imagenes = await pdfToImages(pdfPath);
  let textoCompleto = "";

  for (const imgPath of imagenes) {
    try {
      const texto = await enviarImagenAGoogleVision(imgPath);
      textoCompleto += texto + "\n";
    } catch (err) {
      console.error("❌ Error procesando imagen:", imgPath, err.message);
    }
  }

  return textoCompleto.trim();
}

module.exports = { extraerTextoDesdePDF };
