const OpenAI = require("openai");

console.log("🛠️ Verificando clave de OpenAI...");
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY no está definida. Verifica el archivo .env o las variables en Render.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analizarConIA(texto) {
  try {
    const instrucciones = `
Extrae la información en JSON con los siguientes campos:
{
  "informacion_personal": { "nombre": "", "telefono": "", "correo": "", "direccion": "", "linkedin": "" },
  "educacion": [{ "carrera": "", "institucion": "", "fecha_inicio": "", "fecha_fin": "" }],
  "certificaciones": [],
  "experiencia_laboral": [{ "empresa": "", "cargo": "", "fecha_inicio": "", "fecha_fin": "", "funciones": [] }],
  "idiomas": [{ "idioma": "", "nivel": "" }],
  "conocimientos_informaticos": []
}

✅ Agrega todos los cursos, talleres, diplomados, capacitaciones, bootcamps o programas similares en la sección "certificaciones", incluso si están listados en otras secciones del CV.

✅ Incluye herramientas tecnológicas, lenguajes, frameworks y software en "conocimientos_informaticos", incluso si aparecen bajo nombres distintos como “herramientas”, “stack tecnológico”, “habilidades técnicas”, “software” o similares.

Solo responde con el JSON, sin markdown ni comentarios.`;

    console.log("🧠 Enviando solicitud a OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: instrucciones },
        { role: "user", content: texto },
      ],
    });

    let content = response.choices[0]?.message?.content?.trim();
    console.log("📥 Respuesta bruta OpenAI:", content?.substring(0, 300));

    if (content.startsWith("```")) {
      content = content.replace(/```(?:json)?/g, "").trim();
    }

    const parsed = JSON.parse(content);
    console.log("✅ JSON estructurado generado correctamente");
    return parsed;
  } catch (error) {
    console.error("❌ Error al analizar con OpenAI:", error.message);
    return null;
  }
}

module.exports = { analizarConIA };
