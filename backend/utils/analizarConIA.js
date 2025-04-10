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
  "informacion_personal": {
    "nombre": "",
    "telefono": "",
    "correo": "",
    "direccion": "",
    "linkedin": ""
  },
  "educacion": [
    {
      "carrera": "",
      "institucion": "",
      "fecha_inicio": "",
      "fecha_fin": ""
    }
  ],
  "certificaciones": [],
  "experiencia_laboral": [
    {
      "empresa": "",
      "cargo": "",
      "fecha_inicio": "",
      "fecha_fin": "",
      "funciones": []
    }
  ],
  "idiomas": [
    {
      "idioma": "",
      "nivel": ""
    }
  ],
  "conocimientos_informaticos": []
}

🔹 La sección "educacion" debe incluir TODOS los niveles: básica, media, técnica, profesional, postgrados y similares. No omitas ninguno.
🔹 Los postgrados o post grados deben incluirse solo en la sección de educación, no en certificaciones.
🔹 Si una formación o experiencia no tiene fecha de término, incluye solo la fecha de inicio.
🔹 Si solo hay fecha de término, incluye solo esa fecha.
🔹 Si ambas fechas están ausentes, omítelas.
🔹 Si un trabajo sigue vigente, escribe "En la actualidad" como fecha_fin.
🔹 En la sección "certificaciones", incluye también los cursos, talleres y seminarios (detectados como tales).
🔹 En "conocimientos_informaticos" incluye tecnologías, software, herramientas y frameworks que aparezcan, incluso si están en otras secciones como “stack tecnológico”, “habilidades técnicas”, “herramientas” o similares.

Devuelve únicamente el JSON sin markdown, sin explicaciones ni comentarios.
`;

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
