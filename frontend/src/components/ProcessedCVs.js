import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://tranform-cv.onrender.com/cv/list")
      .then((res) => res.json())
      .then((data) => {
        setCvs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener CVs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography>Cargando CVs procesados...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      {cvs.map((cv) => {
        const parsedJson = cv.json || { error: "JSON inválido" };
        const nombre = parsedJson?.informacion_personal?.nombre || "(Sin nombre)";

        return (
          <Card key={cv.id} sx={{ marginBottom: 3, padding: 2, background: "#f9f9f9" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧑 Nombre: {nombre}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                🗓️ Fecha: {new Date(cv.created_at).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                📦 JSON Parseado:
              </Typography>
              <pre style={{ background: "#272822", color: "#f8f8f2", padding: "1rem", borderRadius: 6, overflowX: "auto" }}>
                {JSON.stringify(parsedJson, null, 2)}
              </pre>

              <Button
                variant="contained"
                color="primary"
                href={`https://tranform-cv.onrender.com/${cv.pdf_url}`}
                target="_blank"
                sx={{ marginTop: 2 }}
              >
                📥 Descargar PDF
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default ProcessedCVs;
