import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const UploadSection = ({ file, handleFileChange, disabled }) => {
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [dragOver, setDragOver] = useState(false);

  const handleClick = () => {
    if (!disabled) inputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(false);
  };

  return (
    <Box
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        border: `2px dashed ${dragOver ? theme.palette.primary.main : "#ccc"}`,
        borderRadius: 4,
        padding: isMobile ? 3 : 5,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: dragOver ? "#f0f0f0" : "transparent",
        transition: "background-color 0.2s",
        maxWidth: 500,
        mx: "auto",
        mt: 2,
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 1 }} />
      <Typography variant="h6" fontWeight="bold">
        Arrastra y suelta o{" "}
        <Box
          component="span"
          sx={{
            color: theme.palette.primary.main,
            textDecoration: "underline",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          carga tus CVs
        </Box>
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled}
      />
      {file && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Archivo seleccionado: {file.name}
        </Typography>
      )}
    </Box>
  );
};

export default UploadSection;
