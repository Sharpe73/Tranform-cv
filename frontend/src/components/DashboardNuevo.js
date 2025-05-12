import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import API_BASE_URL from "../apiConfig";
import ComplexStatisticsCard from "../components/ComplexStatisticsCard";
import ReportsBarChart from "../components/ReportsBarChart";

function DashboardFrontlieReal() {
  const [consumo, setConsumo] = useState(0);
  const [consumoMaximo, setConsumoMaximo] = useState(1);
  const [usuariosActivos, setUsuariosActivos] = useState(0);
  const [cvPorUsuario, setCvPorUsuario] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cv/limite`)
      .then((res) => res.json())
      .then((data) => setConsumoMaximo(data?.limite || 1));

    fetch(`${API_BASE_URL}/cv/consumo`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setConsumo(data?.total || 0));

    fetch(`${API_BASE_URL}/cv/por-usuario`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUsuariosActivos(data.length);
        const chartData = data.map((item) => ({
          name: item.usuario,
          cv: parseInt(item.cantidad)
        }));
        setCvPorUsuario(chartData);
      });
  }, []);

  const porcentajeUso = Math.min((consumo / consumoMaximo) * 100, 100).toFixed(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        📊 Panel General
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            icon="description"
            title="CVs Transformados"
            count={consumo}
            percentage={{ color: "success", amount: `${porcentajeUso}%`, label: "del total mensual" }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            icon="group"
            title="Usuarios Activos"
            count={usuariosActivos}
            percentage={{ color: "info", amount: `+${usuariosActivos}`, label: "este mes" }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            icon="check_circle"
            title="Límite Mensual"
            count={consumoMaximo}
            percentage={{ color: "warning", amount: `${consumo}/${consumoMaximo}`, label: "usado" }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            icon="trending_up"
            title="Uso del Sistema"
            count={`${porcentajeUso}%`}
            percentage={{ color: "primary", amount: "Activos", label: "usuarios con actividad" }}
          />
        </Grid>
      </Grid>

      <Box mt={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={8}>
            <ReportsBarChart
              color="info"
              title="CVs por Usuario"
              description="Transformaciones individuales por usuario"
              date="Actualizado hoy"
              chart={{
                labels: cvPorUsuario.map((d) => d.name),
                datasets: [{ label: "CVs", data: cvPorUsuario.map((d) => d.cv) }],
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default DashboardFrontlieReal;
