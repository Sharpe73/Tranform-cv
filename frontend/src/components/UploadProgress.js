// src/components/UploadProgress.js
import React from "react";
import { LinearProgress, Box } from "@mui/material";

function UploadProgress({ isUploading }) {
  if (!isUploading) return null;

  return (
    <Box sx={{ mt: 2, maxWidth: 400, mx: "auto" }}>
      <LinearProgress />
    </Box>
  );
}

export default UploadProgress;
