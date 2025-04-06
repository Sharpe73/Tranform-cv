import React from "react";
import { Typography } from "@mui/material";

const DownloadLink = ({ pdfLink }) => {
  if (!pdfLink) return null;

  return (
    <Typography variant="body2" color="primary" sx={{ mt: 3 }}>
      <a
        href={pdfLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        📂 Descargar PDF procesado
      </a>
    </Typography>
  );
};

export default DownloadLink;
