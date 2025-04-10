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

🔹 Incluye en "educacion" todos los niveles: básica, media, técnica, profesional y postgrados. No omitas ninguno.
🔹 Si un estudio o experiencia tiene solo una fecha (de inicio o término), muestra solo esa. Si tiene ambas, incluye ambas. Si no hay ninguna, omítelas.
🔹 Si una experiencia laboral está activa (por ejemplo, "a la fecha" o "actualidad"), usa "En la actualidad" como fecha_fin.
🔹 En "certificaciones" incluye cursos, talleres, seminarios, capacitaciones, diplomados que no sean considerados grados formales.
🔹 Postgrados deben ir exclusivamente en la sección "educacion", no en certificaciones.
🔹 No uses el texto "N/A". Si no hay dato, simplemente deja el campo vacío.
🔹 En "conocimientos_informaticos" incluye tecnologías, software, herramientas, lenguajes o frameworks mencionados en cualquier parte del texto, incluso si aparecen bajo otras secciones.

Devuelve solo el JSON sin comentarios ni markdown.
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
