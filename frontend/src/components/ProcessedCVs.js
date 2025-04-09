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
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const descargarPDF = (id) => {
    fetch(`https://tranform-cv.onrender.com/cv/pdf/${id}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cv_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("❌ Error al descargar PDF:", err);
      });
  };

  const filteredCvs = cvs.filter((cv) => {
    const nombre = cv.json?.informacion_personal?.nombre || "";
    return nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const paginatedCvs = filteredCvs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      <Box mb={2}>
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>🧑 Nombre</strong></TableCell>
              <TableCell><strong>🗓️ Fecha</strong></TableCell>
              <TableCell><strong>📥 PDF / JSON</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCvs.map((cv) => {
              const parsedJson = cv.json || { error: "JSON inválido" };
              const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";

              return (
                <TableRow key={cv.id}>
                  <TableCell>{nombre}</TableCell>
                  <TableCell>{new Date(cv.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => descargarPDF(cv.id)}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))
                        }
                        sx={{
                          color: "#f29111",
                          borderColor: "#f29111",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#f29111",
                            color: "#fff",
                          },
                        }}
                      >
                        JSON
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default ProcessedCVs;
