const OpenAI = require("openai");

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
Incluye herramientas tecnológicas, lenguajes, frameworks y software en "conocimientos_informaticos", incluso si están bajo otras secciones como “herramientas”, “stack tecnológico”, “habilidades técnicas”, “software” o similares. Solo responde con el JSON, sin markdown ni comentarios.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: instrucciones },
        { role: "user", content: texto },
      ],
    });

    let content = response.choices[0]?.message?.content?.trim();
    if (content.startsWith("```")) {
      content = content.replace(/```(?:json)?/g, "").trim();
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("❌ Error al analizar con OpenAI:", error.message);
    return null;
  }
}

module.exports = { analizarConIA };
