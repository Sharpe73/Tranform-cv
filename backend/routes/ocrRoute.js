
const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");
const { generarPDF } = require("../utils/generarPDF");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return res.status(400).json({ error: "Imagen base64 no válida." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            },
            {
              type: "text",
              text: `Este es un currículum escaneado. Extrae toda la información posible y devuélvela en JSON con los siguientes campos:
- informacion_personal: { nombre, apellido, correo, telefono, direccion }
- educacion: [ { institucion, titulo, fecha_inicio, fecha_fin } ]
- experiencia: [ { empresa, cargo, fecha_inicio, fecha_fin, descripcion } ]
- habilidades: [ "habilidad1", "habilidad2", ... ]
- certificaciones: [ { nombre, institucion, fecha } ]

Si algún campo no está presente, simplemente omítelo. Devuelve solo el JSON sin explicaciones.`
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;

    let datosEstructurados;
    try {
      datosEstructurados = JSON.parse(content);
    } catch (parseError) {
      return res.status(500).json({ error: "Error al parsear JSON desde la respuesta de OpenAI.", raw: content });
    }

    if (!datosEstructurados.informacion_personal) {
      datosEstructurados.informacion_personal = {};
    }

    const nombreBase = "ocr_" + Date.now();
    const outputPathJSON = path.join(__dirname, "../uploads", `${nombreBase}.json`);
    fs.writeFileSync(outputPathJSON, JSON.stringify(datosEstructurados, null, 2));

    const opciones = {
      templateStyle: "tradicional",
      fontSize: 12,
      fontHeader: "Helvetica",
      fontParagraph: "Helvetica",
      colorHeader: "#000000",
      colorParagraph: "#000000"
    };

    await generarPDF(datosEstructurados, nombreBase, opciones);

    return res.json({
      message: "✅ JSON procesado y PDF generado con éxito.",
      jsonPath: `/uploads/${nombreBase}.json`,
      pdfPath: `/uploads/${nombreBase}.pdf`
    });

  } catch (err) {
    console.error("❌ Error en /ocr:", err);
    return res.status(500).json({ error: "Error procesando OCR con OpenAI.", details: err.message });
  }
});

module.exports = router;
