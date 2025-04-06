import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Paper, Typography,} from "@mui/material";
import UploadSection from "./components/UploadSection";
import ConfigCard from "./components/ConfigCard";
import UploadActions from "./components/UploadActions";
import MessageDisplay from "./components/MessageDisplay";
import DownloadLink from "./components/DownloadLink";

function Transform() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [config, setConfig] = useState({});
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem("cvConfig"));
    if (savedConfig) {
      setConfig(savedConfig);
    }
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
      const response = await axios.post("http://localhost:5000/upload", formData);
      setMessage("✅ Archivo procesado con éxito.");
      if (response.data?.pdfPath) {
        setPdfLink(`http://localhost:5000/${response.data.pdfPath}`);
      }
    } catch (error) {
      console.error("❌ Error al procesar el archivo:", error);
      setMessage("❌ Hubo un error al procesar el archivo. Inténtalo nuevamente.");
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

        <UploadSection file={file} handleFileChange={handleFileChange} />

        <ConfigCard config={config} showConfig={showConfig} setShowConfig={setShowConfig} />

        <UploadActions isUploading={isUploading} handleUpload={handleUpload} />

        {message && <MessageDisplay message={message} />}

        {pdfLink && <DownloadLink pdfLink={pdfLink} />}
      </Paper>
    </Box>
  );
}

export default Transform;
