import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Container,
} from "@mui/material";
import UploadSection from "./UploadSection";
import ConfigCard from "./ConfigCard";
import UploadActions from "./UploadActions";
import MessageDisplay from "./MessageDisplay";
import DownloadLink from "./DownloadLink";
import UserMenu from "./UserMenu";
import API_BASE_URL from "../apiConfig";
import { pdfjs } from "react-pdf";

function Transform() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [config, setConfig] = useState({});
  const [showConfig, setShowConfig] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem("cvConfig"));
    if (savedConfig) {
      setConfig(savedConfig);
    }

    const verificarBloqueo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/cv/consumo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data?.total >= 5) {
          setBloqueado(true);
          setMessage("❌ Has alcanzado el límite mensual. Debes esperar hasta el próximo mes para seguir transformando CVs.");
        }
      } catch (error) {
        console.error("❌ Error al verificar consumo:", error);
      }
    };

    verificarBloqueo();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const convertirPrimeraPaginaAPNG = async (file) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/png");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Por favor, selecciona un archivo.");
      return;
    }

    setIsUploading(true);
    setMessage("🔄 Procesando archivo...");
    setPdfLink("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fontSize", config.fontSize || 12);
    formData.append("fontHeader", config.fontHeader || "Helvetica");
    formData.append("fontParagraph", config.fontParagraph || "Helvetica");
    formData.append("colorHeader", config.colorHeader || "#000000");
    formData.append("colorParagraph", config.colorParagraph || "#000000");
    formData.append("templateStyle", config.templateStyle || "tradicional");

    if (config.logo) {
      const blob = await (await fetch(config.logo)).blob();
      const logoFile = new File([blob], config.logoName || "logo.png", {
        type: blob.type,
      });
      formData.append("logo", logoFile);
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setMessage("✅ Archivo procesado con éxito.");
      if (response.data?.pdfPath) {
        setPdfLink(`${API_BASE_URL}/${response.data.pdfPath}`);
      }
    } catch (error) {
      console.error("❌ Error al procesar el archivo:", error);

      if (error.response?.status === 403) {
        setBloqueado(true);
        setMessage(error.response.data?.message || "❌ Límite mensual alcanzado.");
      } else if (error.response?.status === 404) {
        setMessage("⚠️ Este archivo no contiene texto reconocible. Intentando OCR con IA...");

        try {
          const imageBase64 = await convertirPrimeraPaginaAPNG(file);
          const ocrResponse = await axios.post(`${API_BASE_URL}/ocr`, { imageBase64 });
          console.log("✅ OCR con IA resultó en:", ocrResponse.data);
          setMessage("✅ Texto extraído correctamente con IA. PDF generado desde el backend.");
          if (ocrResponse.data?.pdfPath) {
            setPdfLink(`${API_BASE_URL}${ocrResponse.data.pdfPath}`);
          }
        } catch (ocrError) {
          console.error("❌ Error en OCR con IA:", ocrError);
          setMessage("❌ No se pudo extraer el texto ni con OCR.");
        }
      } else if (error.response?.status === 401) {
        setMessage("❌ No tienes permisos. Inicia sesión nuevamente.");
      } else {
        setMessage("❌ Hubo un error al procesar el archivo. Inténtalo nuevamente.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 6, minHeight: "100vh" }}>
      {/* Este box está fuera del card */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} mt={1} pr={2}>
        <UserMenu />
      </Box>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          align="center"
          fontWeight="bold"
        >
          🖹 Transformar Documento
        </Typography>

        <UploadSection
          file={file}
          handleFileChange={handleFileChange}
          disabled={bloqueado}
        />

        <ConfigCard
          config={config}
          showConfig={showConfig}
          setShowConfig={setShowConfig}
        />

        <UploadActions
          isUploading={isUploading}
          handleUpload={handleUpload}
          disabled={bloqueado}
        />

        {message && <MessageDisplay message={message} />}
        {pdfLink && <DownloadLink pdfLink={pdfLink} />}
      </Paper>
    </Container>
  );
}

export default Transform;
