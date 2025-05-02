const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generarPDF } = require("./generarPDF");
const { analizarConIA } = require("./analizarConIA");

async function procesarCV(rutaArchivo, opciones) {
  try {
    const ext = path.extname(rutaArchivo).toLowerCase();
    let textoExtraido = "";

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(rutaArchivo);
      const data = await pdfParse(dataBuffer);
      textoExtraido = data.text;
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
