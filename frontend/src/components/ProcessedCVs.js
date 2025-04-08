import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
  Stack,
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

  const descargarJSON = (json, nombre) => {
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${nombre}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>🧑 Nombre</strong></TableCell>
              <TableCell><strong>📥 PDF / JSON</strong></TableCell>
              <TableCell><strong>🗓️ Fecha</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cvs.map((cv) => {
              const parsedJson = cv.json || { error: "JSON inválido" };
              const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";

              return (
                <TableRow key={cv.id}>
                  <TableCell>{nombre}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        href={`https://tranform-cv.onrender.com/${cv.pdf_url}`}
                        target="_blank"
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))}
                      >
                        JSON
                      </Button>
                    </Stack>
                  </TableCell>
                  <TableCell>{new Date(cv.created_at).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ProcessedCVs;
