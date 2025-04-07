import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
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
          <TableHead>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>JSON</strong></TableCell>
              <TableCell><strong>PDF</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cvs.map((cv, index) => {
              const parsedJson = cv.json || { error: "JSON inválido" };
              const nombre = parsedJson?.informacion_personal?.nombre || "(Sin nombre)";
              const resumenJson = JSON.stringify(parsedJson).slice(0, 100) + "...";

              return (
                <TableRow key={cv.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{nombre}</TableCell>
                  <TableCell>
                    <pre
                      style={{
                        fontSize: "0.8rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        margin: 0,
                      }}
                    >
                      {resumenJson}
                    </pre>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
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
