
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

function corregirTexto(texto) {
  if (!texto || typeof texto !== "string") return "";
  if (texto.length <= 4 && texto === texto.toUpperCase()) return texto;
  if (texto === texto.toUpperCase()) return texto.charAt(0) + texto.slice(1).toLowerCase();
  return texto;
}

function aplicarCorreccionesALista(lista) {
  return (lista || []).map(item => {
    if (typeof item === "string") return corregirTexto(item);
    const corregido = {};
    for (const key in item) {
      if (Array.isArray(item[key])) {
        corregido[key] = item[key].map(val => corregirTexto(val));
      } else {
        corregido[key] = corregirTexto(item[key]);
      }
    }
    return corregido;
  });
}

async function generarPDF(datos, nombreArchivo, opciones) {
  const plantillaSeleccionada = opciones.templateStyle || "tradicional";
  const pdfPath = path.join(__dirname, "../uploads", `${nombreArchivo}.pdf`);
  const doc = new PDFDocument({ margins: { top: 50, left: 100, right: 100, bottom: 50 } });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  const fuentes = {
    "Helvetica": "Helvetica",
    "Times New Roman": "Times-Roman",
    "Courier": "Courier",
  };

  const fontHeader = fuentes[opciones.fontHeader] || "Helvetica";
  const fontParagraph = fuentes[opciones.fontParagraph] || "Times-Roman";
  const fontSize = opciones.fontSize ? parseInt(opciones.fontSize) : 12;
  const colorHeader = opciones.colorHeader || "#000000";
  const colorParagraph = opciones.colorParagraph || "#000000";
  const estilos = cargarEstilos(plantillaSeleccionada);

  doc.on("pageAdded", aplicarEstilosPagina);
  aplicarEstilosPagina();

  const title = "CURRICULUM VITAE";
  const titleSize = fontSize + 8;

  let logoBuffer;
  let width = 0;
  let height = 0;

  if (opciones.logoPath && fs.existsSync(opciones.logoPath)) {
    logoBuffer = await sharp(opciones.logoPath).png({ force: true }).ensureAlpha().toBuffer();
    const dimensiones = imageSize(logoBuffer);
    width = dimensiones.width;
    height = dimensiones.height;
    const maxSize = 80;
    if (width > maxSize || height > maxSize) {
      const scaleFactor = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scaleFactor);
      height = Math.round(height * scaleFactor);
    }

    const x = doc.page.width - doc.page.margins.right - width;
    const logoY = doc.y - (height - titleSize) / 2 - 20;

    if (estilos.backgroundColor) {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(estilos.backgroundColor);
      doc.restore();
    }

    doc.image(logoBuffer, x, logoY, { width, height });
    doc.moveDown(2);
  } else {
    doc.moveDown(0.5);
  }

  doc.fontSize(titleSize).fillColor(colorHeader).font(fontHeader).text(title, {
    align: "center",
    oblique: true,
  });

  if (doc.y > 200) doc.y = 120;

  function aplicarEstilosPagina() {
    if (estilos.backgroundColor) {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(estilos.backgroundColor);
    }
    doc.fillColor(colorParagraph).fontSize(fontSize).font(fontParagraph);
    doc.y = doc.page.margins.top;
  }

  function agregarSeccionSimple(titulo, contenido) {
    const anchoTexto = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const alturaTexto = doc.heightOfString(contenido || "No especificado", {
      width: anchoTexto,
      align: "justify",
    });
    const espacioRequerido = alturaTexto + 3 * (fontSize + 4);
    const espacioDisponible = doc.page.height - doc.y - doc.page.margins.bottom;
    if (espacioDisponible < espacioRequerido) doc.addPage();

    doc.moveDown(1);
    doc.font(fontHeader).fillColor(colorHeader).fontSize(fontSize + 2).text(corregirTexto(titulo), {
      underline: true,
    });
    doc.moveDown(0.5);
    doc.font(fontParagraph).fontSize(fontSize).fillColor(colorParagraph).text(contenido || "No especificado", {
      align: "justify",
      width: anchoTexto,
    });
    doc.moveDown(1);
  }

  function agregarExperienciaLaboral(titulo, lista) {
    const anchoTexto = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.moveDown(1);
    doc.font(fontHeader).fillColor(colorHeader).fontSize(fontSize + 2).text(corregirTexto(titulo), {
      underline: true,
    });
    doc.moveDown(0.5);
    doc.font(fontParagraph).fontSize(fontSize).fillColor(colorParagraph);

    ordenarPorFecha(lista).forEach(item => {
      const fecha_inicio = item.fecha_inicio || "";
      const fecha_fin = item.fecha_fin || "";
      const fechas = fecha_inicio && fecha_fin ? `${fecha_inicio} - ${fecha_fin}` : fecha_inicio || fecha_fin;
      const encabezado = `${corregirTexto(item.cargo)} en ${corregirTexto(item.empresa)}${fechas ? " (" + fechas + ")" : ""}`;
      const funciones = Array.isArray(item.funciones)
        ? item.funciones.map(f => `- ${corregirTexto(f)}`).join("\n")
        : "No especificado";
      const bloque = `${encabezado}\nFunciones:\n${funciones}\n\n`;

      const altura = doc.heightOfString(bloque, { width: anchoTexto, align: "justify" });
      const disponible = doc.page.height - doc.y - doc.page.margins.bottom;
      if (disponible < altura) doc.addPage();

      doc.text(bloque, { width: anchoTexto, align: "justify" });
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
    return ordenarPorFecha(lista, true).map(item => {
      const fecha_inicio = item.fecha_inicio || "";
      const fecha_fin = item.fecha_fin || "";
      const fecha = fecha_inicio && fecha_fin ? `${fecha_inicio} - ${fecha_fin}` : fecha_inicio || fecha_fin;
      const detalle = `${corregirTexto(item.carrera)}${item.institucion ? ", " + corregirTexto(item.institucion) : ""}`;
      return `${fecha}    ${detalle}`;
    }).join("\n");
  }

  function formatearListaConFormato(lista, ...campos) {
    return (lista || []).map(item => campos.map(campo => corregirTexto(item[campo])).join(" - ")).join("\n");
  }

  function formatearConocimientos(lista) {
    return lista && Array.isArray(lista) && lista.length > 0 ? lista.map(corregirTexto).join(", ") : "No especificado";
  }

  function formatearCertificaciones(lista) {
    return ordenarPorFecha(lista).map(cert => corregirTexto(cert)).join("\n");
  }

  datos.certificaciones = aplicarCorreccionesALista(datos.certificaciones);
  datos.educacion = aplicarCorreccionesALista(datos.educacion);
  datos.experiencia_laboral = aplicarCorreccionesALista(datos.experiencia_laboral);
  datos.idiomas = aplicarCorreccionesALista(datos.idiomas);
  datos.conocimientos_informaticos = datos.conocimientos_informaticos?.map(corregirTexto);

  agregarSeccionSimple("Información Personal", `Nombre: ${corregirTexto(datos.informacion_personal?.nombre)}`);
  agregarSeccionSimple("Educación", formatearEducacionConFechas(datos.educacion));
  if (datos.certificaciones && datos.certificaciones.length > 0) {
    agregarSeccionSimple("Certificaciones", formatearCertificaciones(datos.certificaciones));
  }
  agregarExperienciaLaboral("Experiencia Laboral", datos.experiencia_laboral);
  agregarSeccionSimple("Idiomas", formatearListaConFormato(datos.idiomas, "idioma", "nivel"));
  agregarSeccionSimple("Conocimientos Informáticos", formatearConocimientos(datos.conocimientos_informaticos));

  doc.end();
  return new Promise(resolve => writeStream.on("finish", () => resolve(pdfPath)));
}

module.exports = { generarPDF };