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
  "certificaciones": [], // Incluye cualquier curso, diploma, certificado o certificación encontrado en el texto.
  "experiencia_laboral": [{ "empresa": "", "cargo": "", "fecha_inicio": "", "fecha_fin": "", "funciones": [] }],
  "idiomas": [{ "idioma": "", "nivel": "" }],
  "conocimientos_informaticos": []
}

Reglas importantes:
- Si se encuentran textos que mencionen "certificado", "certificación", "certificaciones", "diploma", "diplomado", "curso" o "formación complementaria", inclúyelos en el campo "certificaciones" como elementos individuales. Si no se encuentra nada relevante, puedes dejar el array vacío.
- No ignores la sección si el título contiene palabras como "certificaciones y cursos", "formación complementaria", "formación adicional", "cursos realizados", etc.
- Todo el contenido debe estar formateado con el tamaño de letra definido por el usuario (por ejemplo: 12). No uses el tamaño del documento original.
- Corrige palabras totalmente en mayúsculas como "EXPERIENCIA LABORAL" → "Experiencia laboral". Mantén siglas como QA o HTML completamente en mayúscula.
- Cualquier texto relacionado con "certificados", "certificaciones", "diplomas" o "diplomados" debe ir en "certificaciones", incluso si aparece en otra sección del CV.
- Herramientas tecnológicas, lenguajes, frameworks o software deben ir en "conocimientos_informaticos", incluso si están bajo otras secciones como “herramientas”, “stack tecnológico”, “habilidades técnicas”, “software” o similares.
- Solo responde con el JSON, sin markdown ni comentarios.
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
