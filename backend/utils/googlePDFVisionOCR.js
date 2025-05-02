const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios");
const { PDFDocument } = require("pdf-lib");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function pdfToImages(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  const images = [];

  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
    singlePagePdf.addPage(copiedPage);
    const singlePageBytes = await singlePagePdf.save();

    const imageBuffer = await sharp(singlePageBytes, { density: 300 })
      .resize({ width: 1200 })
      .png()
      .toBuffer();

    const imgPath = path.join(tempDir, `page_${i + 1}.png`);
    fs.writeFileSync(imgPath, imageBuffer);
    images.push(imgPath);
  }

  return images;
}

async function enviarImagenAGoogleVision(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GCP_VISION_API_KEY}`;
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
      }
    ]
  };

  const response = await axios.post(url, body);
  return response.data.responses[0]?.fullTextAnnotation?.text || "";
}

async function extraerTextoDesdePDF(pdfPath) {
  console.log("📄 Convirtiendo PDF a imágenes...");
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
