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
Extrae la información en formato JSON con los siguientes campos si están presentes:
{
  "informacion_personal": { "nombre": "", "telefono": "", "correo": "", "direccion": "", "linkedin": "" },
  "educacion": [{ "carrera": "", "institucion": "", "fecha_inicio": "", "fecha_fin": "" }],
  "certificaciones": [], // Incluye solo si hay evidencia textual de certificados, cursos o diplomas.
  "experiencia_laboral": [{ "empresa": "", "cargo": "", "fecha_inicio": "", "fecha_fin": "", "funciones": [] }],
  "idiomas": [{ "idioma": "", "nivel": "" }],
  "conocimientos_informaticos": []
}

Reglas importantes:
- SOLO agrega elementos en "certificaciones" si el texto incluye explícitamente palabras como: "certificado", "certificación", "certificaciones", "diploma", "diplomado", "curso", "formación complementaria".
- No infieras certificaciones a partir de herramientas o tecnologías listadas como parte del aprendizaje personal o experiencia profesional.
- Si no se encuentra ninguna de esas palabras clave en el texto, deja el campo "certificaciones" como un array vacío.
- Corrige palabras totalmente en mayúsculas como "EXPERIENCIA LABORAL" → "Experiencia laboral". Mantén siglas como QA o HTML completamente en mayúscula.
- Herramientas tecnológicas, lenguajes, frameworks o software deben ir en "conocimientos_informaticos", incluso si están bajo otras secciones como “herramientas”, “stack tecnológico”, “habilidades técnicas”, “software” o similares.
- Solo responde con el JSON, sin markdown ni comentarios.
`;
    console.log("🧠 Enviando solicitud a OpenAI...");

    const response = await openai.chat.completions.create({
      model:"gpt-3.5-turbo",
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
