import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Tooltip as MuiTooltip,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import API_BASE_URL from "../apiConfig";

const COLORS = ["#1976d2", "#ffb74d"];
const ROLE_COLORS = {
  admin: "#1976d2",
  user: "#4caf50",
  "gerente de proyecto": "#9c27b0",
};

function DashboardNuevo() {
  const [consumo, setConsumo] = useState(0);
  const [consumoMaximo, setConsumoMaximo] = useState(null);
  const [dataPorUsuario, setDataPorUsuario] = useState([]);
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetch(`${API_BASE_URL}/cv/limite`)
      .then((res) => res.json())
      .then((data) => setConsumoMaximo(data?.limite))
      .catch((error) => console.error("❌ Error al obtener límite:", error));

    fetch(`${API_BASE_URL}/cv/consumo`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setConsumo(data?.total || 0))
      .catch((error) => console.error("❌ Error al obtener consumo:", error));

    fetch(`${API_BASE_URL}/cv/por-usuario`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const convertidos = data.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad),
        }));
        setDataPorUsuario(convertidos);
      })
      .catch((error) => console.error("❌ Error al obtener datos por usuario:", error));
  }, []);

  if (consumoMaximo === null) {
    return <Typography align="center">Cargando datos...</Typography>;
  }

  const restante = Math.max(consumoMaximo - consumo, 0);
  const porcentaje = Math.min((consumo / consumoMaximo) * 100, 100).toFixed(2);
  const data = [
    { name: "CVs usados", value: consumo },
    { name: "CVs restantes", value: restante },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        📊 Panel de Consumo de CVs
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
              CONSUMO DE CV VS TOTAL X MES
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <Box mt={2}>
              <Typography align="center">
                Progreso mensual: {consumo} de {consumoMaximo} CVs ({porcentaje}%)
              </Typography>
              <MuiTooltip title={`${porcentaje}% utilizado`} arrow>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(porcentaje)}
                  sx={{ mt: 1, height: 10, borderRadius: 5 }}
                />
              </MuiTooltip>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
              UTILIZACIÓN POR USUARIO
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dataPorUsuario}
                margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="usuario"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" isAnimationActive={false}>
                  {dataPorUsuario.map((entry, index) => (
                    <Cell key={index} fill={ROLE_COLORS[entry.rol] || "#9e9e9e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardNuevo;
