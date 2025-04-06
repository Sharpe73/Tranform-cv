import React from "react";
import { Box, Button, Typography } from "@mui/material";

function FileSelector({ file, onFileChange }) {
  return (
    <Box sx={{ mt: 2, maxWidth: 400, mx: "auto" }}>
      <input
        accept=".pdf,.docx"
        style={{ display: "none" }}
        id="upload-file"
        type="file"
        onChange={onFileChange}
      />
      <label htmlFor="upload-file">
        <Button
          variant="contained"
          color="primary"
          component="span"
          fullWidth
        >
          📄 Seleccionar Archivo
        </Button>
      </label>
      {file && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Archivo seleccionado: {file.name}
        </Typography>
      )}
    </Box>
  );
}

export default FileSelector;
