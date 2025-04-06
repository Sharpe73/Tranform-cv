// 📄 components/UploadActions.js
import React from "react";
import { Box, Button, LinearProgress } from "@mui/material";

const UploadActions = ({ isUploading, handleUpload }) => {
  return (
    <Box sx={{ mt: 3, maxWidth: 400, mx: "auto" }}>
      <Button
        variant="contained"
        color="success"
        onClick={handleUpload}
        disabled={isUploading}
        fullWidth
      >
        {isUploading ? "⏳ Procesando..." : "📤 Subir Archivo"}
      </Button>

      {isUploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default UploadActions;
