import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Paper, Typography } from "@mui/material";
import UploadSection from "./UploadSection";
import ConfigCard from "./ConfigCard";
import UploadActions from "./UploadActions";
import MessageDisplay from "./MessageDisplay";
import DownloadLink from "./DownloadLink";
import API_BASE_URL from "../apiConfig";

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
      });

      setMessage("✅ Archivo procesado con éxito.");
      if (response.data?.pdfPath) {
        setPdfLink(`${API_BASE_URL}/${response.data.pdfPath}`);
      }
    } catch (error) {
      console.error("❌ Error al procesar el archivo:", error);

      if (error.response?.status === 403) {
        setBloqueado(true); // 🔒 bloquear UI
        setMessage(error.response.data?.message || "❌ Límite mensual alcanzado.");
      } else if (error.response?.status === 404) {
        setMessage("⚠️ Este archivo no contiene texto reconocible.");
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
    <Box sx={{ maxWidth: 700, margin: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" color="primary" gutterBottom>
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
    </Box>
  );
}

export default Transform;
