// routes/ocrRoute.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");

const router = express.Router();

const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.post("/ocr", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ninguna imagen." });
    }

    const resultado = await Tesseract.recognize(req.file.path, "spa", {
      logger: (m) => console.log(`[OCR] ${m.status} (${Math.floor(m.progress * 100)}%)`),
    });

    fs.unlinkSync(req.file.path); // eliminar archivo temporal
    res.json({ texto: resultado.data.text });
  } catch (error) {
    console.error("❌ Error OCR:", error.message);
    res.status(500).json({ error: "Error al procesar la imagen con OCR." });
  }
});

module.exports = router;
