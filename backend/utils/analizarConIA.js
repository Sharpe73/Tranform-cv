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

🔹 En "educacion", incluye todos los niveles: básica, media, técnica, profesional, diplomados y postgrados (o "post grado").
🔹 NO incluyas postgrados en "certificaciones", deben ir solo en "educacion".
🔹 En "certificaciones", agrega cursos, talleres, seminarios, y similares si aparecen en el texto.
🔹 Si una formación o experiencia no tiene fecha de término, incluye solo la fecha de inicio.
🔹 Si solo tiene fecha de término, incluye solo esa fecha.
🔹 Si no tiene ninguna fecha, omítelas por completo.
🔹 Si el texto indica que el empleo aún está vigente (por ejemplo: "a la fecha", "presente", "actualidad", "actual"), entonces en "fecha_fin" coloca: "En la actualidad".
🔹 En "conocimientos_informaticos", incluye tecnologías, herramientas, software, lenguajes y frameworks que aparezcan, incluso si están bajo secciones como “stack tecnológico”, “habilidades técnicas” o similares.

Devuelve únicamente el JSON. No incluyas markdown, explicaciones ni comentarios.
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
