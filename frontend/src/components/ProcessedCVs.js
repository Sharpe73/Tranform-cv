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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>🧑 Nombre</strong></TableCell>
              <TableCell><strong>📦 JSON Completo</strong></TableCell>
              <TableCell><strong>📥 PDF</strong></TableCell>
              <TableCell><strong>🗓️ Fecha</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cvs.map((cv) => {
              const parsedJson = cv.json || { error: "JSON inválido" };
              const nombre = parsedJson?.informacion_personal?.nombre || "(Sin nombre)";
              const jsonPretty = JSON.stringify(parsedJson, null, 2);

              return (
                <TableRow key={cv.id}>
                  <TableCell>{nombre}</TableCell>
                  <TableCell>
                    <pre
                      style={{
                        maxHeight: 200,
                        overflowY: "auto",
                        fontSize: "0.75rem",
                        background: "#f0f0f0",
                        padding: "10px",
                        borderRadius: 4,
                      }}
                    >
                      {jsonPretty}
                    </pre>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      href={`https://tranform-cv.onrender.com/${cv.pdf_url}`}
                      target="_blank"
                    >
                      Descargar
                    </Button>
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
