import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
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
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isMobile = useMediaQuery("(max-width:600px)");

  const cargarCVs = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    cargarCVs();
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

  const eliminarTodos = async () => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar TODOS los CVs procesados? Esta acción no se puede deshacer.");
    if (!confirmacion) return;

    const pin = prompt("Ingresa el PIN de seguridad:");
    if (!pin) return;

    try {
      const res = await fetch("https://tranform-cv.onrender.com/admin/limpiar-cvs", {
        method: "POST",
        headers: {
          "x-admin-secret": pin,
        },
      });

      const data = await res.json();
      if (res.status === 200) {
        alert(data.mensaje || "CVs eliminados correctamente");
        cargarCVs();
      } else {
        alert("❌ PIN incorrecto");
      }
    } catch (err) {
      alert("❌ Error al eliminar los CVs");
      console.error(err);
    }
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

      <Box
        mb={2}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={eliminarTodos}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: isMobile ? "0.85rem" : "1rem",
            padding: isMobile ? "6px 12px" : "8px 18px",
            fontWeight: "bold",
          }}
        >
          Eliminar todos los CVs
        </Button>
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
                    <Stack
                      direction={isMobile ? "column" : "row"}
                      spacing={1}
                      alignItems={isMobile ? "stretch" : "center"}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => descargarPDF(cv.id)}
                        sx={{
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          padding: isMobile ? "4px 8px" : "6px 12px",
                        }}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CodeIcon />}
                        onClick={() =>
                          descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))
                        }
                        sx={{
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          padding: isMobile ? "4px 8px" : "6px 12px",
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
