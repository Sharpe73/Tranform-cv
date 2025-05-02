const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generarPDF } = require("./generarPDF");
const { analizarConIA } = require("./analizarConIA");
const { fromPath } = require("pdf2pic");
const { extraerTextoImagenVision } = require("./googleOCR");

// Crear carpeta temporal si no existe
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Convierte todas las páginas del PDF a imágenes PNG
async function convertirTodasLasPaginas(pdfPath) {
  const options = {
    density: 150,
    saveFilename: "pagina",
    savePath: tempDir,
    format: "png",
    width: 1000,
    height: 1300,
  };

  const convert = fromPath(pdfPath, options);
  const result = await convert.bulk(-1); // -1 = todas las páginas
  return result.map((r) => r.path); // devuelve array de rutas
}

async function procesarCV(rutaArchivo, opciones) {
  try {
    const ext = path.extname(rutaArchivo).toLowerCase();
    let textoExtraido = "";

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(rutaArchivo);
      const data = await pdfParse(dataBuffer);
      textoExtraido = data.text;

      // Si no hay texto real en el PDF, aplicar OCR a todas las páginas
      if (!textoExtraido || textoExtraido.trim().length < 10) {
        console.log("🔎 PDF sin texto real. Aplicando OCR en todas las páginas...");
        const imagenes = await convertirTodasLasPaginas(rutaArchivo);

        const textosPorPagina = [];
        for (const imgPath of imagenes) {
          const texto = await extraerTextoImagenVision(imgPath);
          if (texto && texto.trim().length > 0) {
            textosPorPagina.push(texto);
          }

          // Eliminar imagen después de usarla
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }

        textoExtraido = textosPorPagina.join("\n");

        if (!textoExtraido || textoExtraido.trim().length < 10) {
          const error = new Error(`OCR no pudo extraer texto del archivo ${rutaArchivo}`);
          error.statusCode = 404;
          throw error;
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
