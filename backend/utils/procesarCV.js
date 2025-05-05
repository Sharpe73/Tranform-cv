
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generarPDF } = require("./generarPDF");
const { analizarConIA } = require("./analizarConIA");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const Tesseract = require("tesseract.js");

async function procesarCV(rutaArchivo, opciones) {
  try {
    const ext = path.extname(rutaArchivo).toLowerCase();
    let textoExtraido = ""

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(rutaArchivo);
      const data = await pdfParse(dataBuffer);
      textoExtraido = data.text;

      if (!textoExtraido || textoExtraido.trim().length < 10) {
        console.log("⚠️ PDF sin texto extraíble, aplicando OCR...");

        const pdfDoc = await PDFDocument.load(dataBuffer);
        const numPages = Math.min(pdfDoc.getPageCount(), 3);
        textoExtraido = "";

        for (let i = 0; i < numPages; i++) {
          const newDoc = await PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
          newDoc.addPage(copiedPage);
          const singlePagePDF = await newDoc.save();

          const imagePath = path.join(__dirname, `../uploads/temp_page_${i + 1}.png`);
          await sharp(singlePagePDF).png().toFile(imagePath);

          const result = await Tesseract.recognize(imagePath, "spa");
          textoExtraido += result.data.text + "\n";

          fs.unlinkSync(imagePath); // Borrar imagen temporal
        }
      }

    } else if (ext === ".docx") {
      const data = fs.readFileSync(rutaArchivo);
      const result = await mammoth.extractRawText({ buffer: data });
      textoExtraido = result.value;
    } else {
      const error = new Error(`Formato no soportado (${rutaArchivo})`);
      error.statusCode = 400;
      throw error;
    }

    if (!textoExtraido || textoExtraido.trim().length < 10) {
      const error = new Error(`El archivo ${rutaArchivo} no contiene texto válido.`);
      error.statusCode = 404;
      throw error;
    }

    console.log("🔍 Texto extraído (primeros 300 caracteres):", textoExtraido.substring(0, 300));

    let datosEstructurados = await analizarConIA(textoExtraido);

    console.log("🧠 Respuesta OpenAI:", datosEstructurados);

    if (!datosEstructurados) {
      const error = new Error("No se pudo generar el JSON con OpenAI.");
      error.statusCode = 500;
      throw error;
    }

    if (!datosEstructurados.informacion_personal) {
      datosEstructurados.informacion_personal = {};
    }

    const nombreBase = path.basename(rutaArchivo, ext);
    const outputPathJSON = path.join(__dirname, "../uploads", `${nombreBase}.json`);
    fs.writeFileSync(outputPathJSON, JSON.stringify(datosEstructurados, null, 2));

    opciones.templateStyle = "tradicional";
    await generarPDF(datosEstructurados, nombreBase, opciones);
    return outputPathJSON;
  } catch (error) {
    console.error(`❌ Error procesando CV:`, error);
    throw error;
  }
}

module.exports = { procesarCV };
