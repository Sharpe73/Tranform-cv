import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
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

  const handleOpenDialog = () => {
    setPin("");
    setPinError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const confirmarEliminacion = async () => {
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
        setOpenDialog(false);
        setPin("");
        setPinError("");
        alert(data.mensaje || "CVs eliminados correctamente");
        cargarCVs();
      } else {
        setPinError("❌ PIN incorrecto");
      }
    } catch (err) {
      setPinError("❌ Error al eliminar los CVs");
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
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      <Box
        mb={2}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
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
          startIcon={<DeleteIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: "#d32f2f",
            fontWeight: "bold",
            width: { xs: "100%", sm: "auto" },
            px: 3,
            py: 1.2,
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          ELIMINAR TODOS LOS CVS
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ingresa el PIN de seguridad</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            error={Boolean(pinError)}
            helperText={pinError}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={confirmarEliminacion} variant="contained" color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 2,
        }}
      >
        {paginatedCvs.map((cv) => {
          const parsedJson = cv.json || { error: "JSON inválido" };
          const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";

          return (
            <Card key={cv.id} variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  🧑 {nombre}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  🗓️ {new Date(cv.created_at).toLocaleString("es-CL")}
                </Typography>
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={1} width="100%" justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => descargarPDF(cv.id)}
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
              </CardActions>
            </Card>
          );
        })}
      </Box>

      <Box mt={4} display="flex" justifyContent="center">
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
