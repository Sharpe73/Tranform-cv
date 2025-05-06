import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CloudUpload, PhotoCamera, Close } from "@mui/icons-material";

function Config({ setConfig }) {
  const storedConfig = JSON.parse(localStorage.getItem("cvConfig")) || {};
  const [organizationName, setOrganizationName] = useState(storedConfig.organizationName || "");
  const [logoBase64, setLogoBase64] = useState(storedConfig.logo || null);
  const [logoFileName, setLogoFileName] = useState(storedConfig.logoName || "No definido");
  const [fontHeader, setFontHeader] = useState(storedConfig.fontHeader || "Helvetica");
  const [fontParagraph, setFontParagraph] = useState(storedConfig.fontParagraph || "Times New Roman");
  const [fontSize, setFontSize] = useState(storedConfig.fontSize || 12);
  const [colorHeader, setColorHeader] = useState(storedConfig.colorHeader || "#000000");
  const [colorParagraph, setColorParagraph] = useState(storedConfig.colorParagraph || "#000000");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (storedConfig.logo) {
      setLogoBase64(storedConfig.logo);
    }
  }, [storedConfig.logo]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setLogoBase64(null);
    setLogoFileName("No definido");
    const stored = JSON.parse(localStorage.getItem("cvConfig")) || {};
    delete stored.logo;
    delete stored.logoName;
    localStorage.setItem("cvConfig", JSON.stringify(stored));
    setSnackbarOpen(true);
  };

  const handleSave = () => {
    const newConfig = {
      fontHeader,
      fontParagraph,
      fontSize,
      colorHeader,
      colorParagraph,
      logo: logoBase64,
      logoName: logoFileName,
      templateStyle: "tradicional",
      organizationName,
    };

    localStorage.setItem("cvConfig", JSON.stringify(newConfig));
    if (setConfig) setConfig(newConfig);
    alert("✅ Configuración guardada correctamente");
  };

  return (
    <Box
      sx={{
        pt: { xs: 2, md: 4 },
        pb: 6,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          mt: 2,
          ml: { xs: 2, md: 10 },
          p: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: 700,
          borderRadius: 4,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
          📄 Configuración del PDF
        </Typography>

        <TextField
          label="Nombre de la Organización"
          fullWidth
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🖼️ Logo
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            archivo <strong>PNG</strong> o <strong>SVG</strong>
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              gap: 2,
              border: "1px solid #ccc",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Button
              variant="contained"
              component="label"
              color="primary"
              startIcon={<PhotoCamera />}
            >
              Subir Logo
              <input type="file" hidden onChange={handleLogoChange} />
            </Button>
            <Typography variant="body2" noWrap>
              {logoFileName}
            </Typography>
            {logoBase64 && (
              <IconButton color="error" size="small" onClick={handleLogoDelete}>
                <Close />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🔤 Fuentes y Colores
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Fuente del Encabezado</InputLabel>
              <Select
                value={fontHeader}
                label="Fuente del Encabezado"
                onChange={(e) => setFontHeader(e.target.value)}
              >
                <MenuItem value="Helvetica">Helvetica</MenuItem>
                <MenuItem value="Courier">Courier</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Color del Encabezado"
              type="color"
              value={colorHeader}
              onChange={(e) => setColorHeader(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              mt: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Fuente del Párrafo</InputLabel>
              <Select
                value={fontParagraph}
                label="Fuente del Párrafo"
                onChange={(e) => setFontParagraph(e.target.value)}
              >
                <MenuItem value="Helvetica">Helvetica</MenuItem>
                <MenuItem value="Courier">Courier</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Color del Párrafo"
              type="color"
              value={colorParagraph}
              onChange={(e) => setColorParagraph(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Tamaño de letra"
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          sx={{ mt: 3 }}
        />

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            startIcon={<CloudUpload />}
            sx={{ px: 4 }}
          >
            Guardar Cambios
          </Button>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="info" variant="filled" onClose={() => setSnackbarOpen(false)}>
            🗑️ Logo eliminado correctamente
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default Config;
