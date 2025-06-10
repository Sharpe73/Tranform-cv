import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Image as ImageIcon,
  TextFields,
  Title,
  FormatColorText,
  FormatSize,
} from "@mui/icons-material";

function ConfigCard({ config, showConfig, setShowConfig, inlineMode = false }) {
  const renderHeader = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: inlineMode ? "flex-start" : "space-between",
        gap: 1,
        cursor: "pointer",
      }}
      onClick={() => setShowConfig(!showConfig)}
    >
      <Typography
        variant={inlineMode ? "body1" : "h6"}
        fontWeight="bold"
        sx={{
          color: inlineMode ? "primary.main" : "text.primary",
        }}
      >
        🎨 Configuración activa
      </Typography>
      <IconButton size="small">
        {showConfig ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
    </Box>
  );

  const configContent = (
    <Collapse in={showConfig}>
      <Box sx={{ mt: 2, pl: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>
          <Title sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Fuente encabezado:</b> {config.fontHeader}
        </Typography>
        <Typography>
          <TextFields sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Fuente párrafo:</b> {config.fontParagraph}
        </Typography>
        <Typography>
          <FormatColorText sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Color encabezado:</b>{" "}
          <span style={{
            backgroundColor: config.colorHeader,
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "10px"
          }}>
            {config.colorHeader}
          </span>
        </Typography>
        <Typography>
          <FormatColorText sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Color párrafo:</b>{" "}
          <span style={{
            backgroundColor: config.colorParagraph,
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "10px"
          }}>
            {config.colorParagraph}
          </span>
        </Typography>
        <Typography>
          <FormatSize sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Tamaño de letra:</b> {config.fontSize}
        </Typography>
        <Typography>
          <ImageIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          <b>Logo:</b> {config.logoName || "Sin logo"}
        </Typography>
      </Box>
    </Collapse>
  );

  if (inlineMode) {
    return (
      <Box sx={{ ml: 2 }}>
        {renderHeader}
        {configContent}
      </Box>
    );
  }

  return (
    <Card
      sx={{
        mt: 4,
        backgroundColor: "#f9f9f9",
        maxWidth: 400,
        mx: "auto",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
        {renderHeader}
        {configContent}
      </CardContent>
    </Card>
  );
}

export default ConfigCard;
