import React from "react";
import { Box, Button, LinearProgress } from "@mui/material";

const UploadActions = ({ isUploading, handleUpload, disabled, variant }) => {
  const isModern = variant === "modern";

  return (
    <Box sx={{ mt: 3, maxWidth: 400, mx: "auto" }}>
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={isUploading || disabled}
        fullWidth
        sx={{
          backgroundColor: isModern ? "#7b1fa2" : undefined, // morado
          "&:hover": {
            backgroundColor: isModern ? "#6a1b9a" : undefined,
          },
          fontWeight: "bold",
          fontSize: "1rem",
          py: 1.5,
        }}
      >
        {isUploading ? "⏳ Procesando..." : "➕ Subir Archivo"}
      </Button>

      {isUploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default UploadActions;
