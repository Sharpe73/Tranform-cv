const fs = require("fs");
const { Document, Packer, Paragraph, TextRun } = require("docx");

async function crearDocDesdeJSON(json, outputPath) {
  const doc = new Document({
    creator: "Tranform CV",
    title: "Currículum generado",
    description: "Documento generado desde JSON",
  });

  const seccion = [];

  const info = json?.informacion_personal || {};
  seccion.push(
    new Paragraph({
      children: [new TextRun({ text: "Información Personal", bold: true, size: 28 })],
      spacing: { after: 200 },
    })
  );
  for (const [clave, valor] of Object.entries(info)) {
    if (valor) seccion.push(new Paragraph(`${clave}: ${valor}`));
  }

  const educacion = json?.educacion || [];
  if (educacion.length > 0) {
    seccion.push(new Paragraph({
      children: [new TextRun({ text: "Educación", bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }));
    educacion.forEach((edu) =>
      seccion.push(new Paragraph(`${edu.carrera} en ${edu.institucion} (${edu.fecha_inicio || ""} - ${edu.fecha_fin || ""})`))
    );
  }

  const certs = json?.certificaciones || [];
  if (certs.length > 0) {
    seccion.push(new Paragraph({
      children: [new TextRun({ text: "Certificaciones", bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }));
    certs.forEach((cert) => seccion.push(new Paragraph(`- ${cert}`)));
  }

  const experiencia = json?.experiencia_laboral || [];
  if (experiencia.length > 0) {
    seccion.push(new Paragraph({
      children: [new TextRun({ text: "Experiencia Laboral", bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }));
    experiencia.forEach((exp) => {
      seccion.push(new Paragraph(`${exp.cargo} en ${exp.empresa} (${exp.fecha_inicio || ""} - ${exp.fecha_fin || ""})`));
      (exp.funciones || []).forEach((funcion) => {
        seccion.push(new Paragraph({ text: `• ${funcion}`, bullet: { level: 0 } }));
      });
    });
  }

  const idiomas = json?.idiomas || [];
  if (idiomas.length > 0) {
    seccion.push(new Paragraph({
      children: [new TextRun({ text: "Idiomas", bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }));
    idiomas.forEach((idioma) => seccion.push(new Paragraph(`${idioma.idioma} - ${idioma.nivel}`)));
  }

  const conocimientos = json?.conocimientos_informaticos || [];
  if (conocimientos.length > 0) {
    seccion.push(new Paragraph({
      children: [new TextRun({ text: "Conocimientos Informáticos", bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }));
    seccion.push(new Paragraph(conocimientos.join(", ")));
  }

  doc.addSection({ children: seccion });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

module.exports = { crearDocDesdeJSON };
