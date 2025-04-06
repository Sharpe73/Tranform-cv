const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");
const { imageSize } = require("image-size");

function cargarEstilos(plantilla) {
  const estilosPath = path.join(__dirname, "../plantillas.json");
  if (!fs.existsSync(estilosPath)) return {};
  const estilos = JSON.parse(fs.readFileSync(estilosPath, "utf-8")).plantillas;
  return estilos[plantilla] || estilos["tradicional"] || {};
}

async function generarPDF(datos, nombreArchivo, opciones) {
  const plantillaSeleccionada = opciones.templateStyle || "tradicional";
  const pdfPath = path.join(__dirname, "../uploads", `${nombreArchivo}.pdf`);
  const doc = new PDFDocument({
    margins: { top: 50, left: 100, right: 100, bottom: 50 },
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  const fuentes = {
    "Helvetica": "Helvetica",
    "Times New Roman": "Times-Roman",
    "Courier": "Courier",
  };

  const fontHeader = fuentes[opciones.fontHeader] || "Helvetica";
  const fontParagraph = fuentes[opciones.fontParagraph] || "Helvetica";
  const fontSize = opciones.fontSize ? parseInt(opciones.fontSize) : 12;
  const colorHeader = opciones.colorHeader || "#000000";
  const colorParagraph = opciones.colorParagraph || "#000000";
  const estilos = cargarEstilos(plantillaSeleccionada);

  doc.on("pageAdded", aplicarEstilosPagina);
  aplicarEstilosPagina();

  doc.moveDown(1);
  const logoY = doc.y;
  const titleSize = fontSize + 8;

  let logoBuffer;
  let width = 0;
  let height = 0;

  if (opciones.logoPath && fs.existsSync(opciones.logoPath)) {
    logoBuffer = await sharp(opciones.logoPath)
      .png({ force: true })
      .ensureAlpha()
      .toBuffer();

    const dimensiones = imageSize(logoBuffer);
    width = dimensiones.width;
    height = dimensiones.height;

    const maxSize = 80;
    if (width > maxSize || height > maxSize) {
      const scaleFactor = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scaleFactor);
      height = Math.round(height * scaleFactor);
    }
  }

  const title = "CURRICULUM VITAE";
  const titleY = logoY + 10;

  if (logoBuffer) {
    const x = doc.page.width - doc.page.margins.right - width;
    const logoAlignedY = titleY - (height - titleSize) / 2 - 20;

   
    if (estilos.backgroundColor) {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(estilos.backgroundColor);
      doc.restore();
    }

    doc.image(logoBuffer, x, logoAlignedY, { width, height });
    console.log("✅ Logo insertado correctamente");
  }

  doc.fontSize(titleSize).fillColor(colorHeader).font(fontHeader).text(title, {
    align: "center",
    oblique: true,
  });

  doc.moveDown(1);

  function aplicarEstilosPagina() {
    if (estilos.backgroundColor) {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(estilos.backgroundColor);
    }
    doc.fillColor(colorParagraph).fontSize(fontSize).font(fontParagraph);
    doc.y = doc.page.margins.top;
  }

  function agregarSeccion(titulo, contenido) {
    const lineas = contenido.split("\n").length + 3;
    const alturaLinea = fontSize + 4;
    const espacioRequerido = lineas * alturaLinea;
    const espacioDisponible = doc.page.height - doc.y - doc.page.margins.bottom;

    if (espacioDisponible < espacioRequerido) {
      doc.addPage();
    }

    const anchoTexto = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.moveDown(1);
    doc.font(fontHeader).fillColor(colorHeader).fontSize(fontSize + 2).text(titulo, {
      underline: true,
      width: anchoTexto,
    });
    doc.moveDown(0.5);
    doc.font(fontParagraph).fontSize(fontSize).fillColor(colorParagraph).text(contenido || "No especificado", {
      align: "justify",
      width: anchoTexto,
    });
    doc.moveDown(1);
  }

  function ordenarPorFecha(lista, asc = false) {
    return (lista || []).slice().sort((a, b) => {
      const fechaA = new Date(a.fecha_inicio || a.fecha || "1900-01-01");
      const fechaB = new Date(b.fecha_inicio || b.fecha || "1900-01-01");
      return asc ? fechaA - fechaB : fechaB - fechaA;
    });
  }

  function formatearEducacionConFechas(lista) {
    const ordenada = ordenarPorFecha(lista, true);
    return ordenada.map(item => {
      const fecha = `${item.fecha_inicio || "N/A"} - ${item.fecha_fin || "N/A"}`;
      const detalle = `${item.carrera || "No especificado"}, ${item.institucion || "No especificado"}`;
      return `${fecha}    ${detalle}`;
    }).join("\n");
  }

  function formatearListaConFormato(lista, ...campos) {
    return (lista || []).map(item => campos.map(campo => item[campo] || "No especificado").join(" - ")).join("\n");
  }

  function formatearListaConViñetas(lista, ...campos) {
    const ordenada = ordenarPorFecha(lista);
    return ordenada.map(item => {
      const encabezado = `${item[campos[0]] || "No especificado"} en ${item[campos[1]] || "No especificado"} (${item[campos[2]] || "N/A"} - ${item[campos[3]] || "N/A"})`;
      const funciones = (Array.isArray(item[campos[4]]) ? item[campos[4]].map(funcion => `- ${funcion}`).join("\n") : "No especificado");
      return `${encabezado}\nFunciones:\n${funciones}`;
    }).join("\n\n");
  }

  function formatearConocimientos(lista) {
    return lista && Array.isArray(lista) && lista.length > 0 ? lista.join(", ") : "No especificado";
  }

  function formatearCertificaciones(lista) {
    const ordenada = ordenarPorFecha(lista);
    return ordenada.map(cert => `${cert}`).join("\n");
  }

  agregarSeccion("Información Personal", `Nombre: ${datos.informacion_personal?.nombre || "No especificado"}`);
  agregarSeccion("Educación", formatearEducacionConFechas(datos.educacion));
  if (datos.certificaciones && datos.certificaciones.length > 0) {
    agregarSeccion("Certificaciones", formatearCertificaciones(datos.certificaciones));
  }
  agregarSeccion("Experiencia Laboral", formatearListaConViñetas(datos.experiencia_laboral, "cargo", "empresa", "fecha_inicio", "fecha_fin", "funciones"));
  agregarSeccion("Idiomas", formatearListaConFormato(datos.idiomas, "idioma", "nivel"));
  agregarSeccion("Conocimientos Informáticos", formatearConocimientos(datos.conocimientos_informaticos));

  doc.end();
  return new Promise(resolve => writeStream.on("finish", () => resolve(pdfPath)));
}

module.exports = { generarPDF };
