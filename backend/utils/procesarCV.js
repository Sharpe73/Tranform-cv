const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generarPDF } = require("./generarPDF");
const { analizarConIA } = require("./analizarConIA");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const Tesseract = require("tesseract.js");
const { spawnSync } = require("child_process");

async function procesarCV(rutaArchivo, opciones) {
  try {
    const ext = path.extname(rutaArchivo).toLowerCase();
    let textoExtraido = "";

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(rutaArchivo);
      const data = await pdfParse(dataBuffer);
      textoExtraido = data.text;

      if (!textoExtraido || textoExtraido.trim().length < 10) {
        console.log("⚠️ PDF sin texto extraíble, aplicando OCR...");

        const pdfDoc = await PDFDocument.load(dataBuffer);
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [0]); // ✅ Uso correcto
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();

        const tempPdfPath = path.join(__dirname, "../uploads/temp.pdf");
        const tempImagePath = path.join(__dirname, "../uploads/temp.png");

        fs.writeFileSync(tempPdfPath, pdfBytes);

        const convert = spawnSync("pdftoppm", [tempPdfPath, tempImagePath.replace(".png", ""), "-png", "-singlefile"]);
        if (convert.error) throw convert.error;

        const buffer = fs.readFileSync(tempImagePath);
        const pngBuffer = await sharp(buffer).png().toBuffer();

        const result = await Tesseract.recognize(pngBuffer, "spa");
        textoExtraido = result.data.text;

        fs.unlinkSync(tempPdfPath);
        fs.unlinkSync(tempImagePath);
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

    const datosEstructurados = await analizarConIA(textoExtraido);

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
