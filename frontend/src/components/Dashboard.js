import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Tooltip as MuiTooltip,
  Grid,
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

const CONSUMO_MAXIMO = 500;
const COLORS = ["#1976d2", "#ffb74d"];

function Dashboard() {
  const [consumo, setConsumo] = useState(0);
  const [dataPorUsuario, setDataPorUsuario] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cv/consumo`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setConsumo(data?.total || 0);
      })
      .catch((error) => {
        console.error("❌ Error al obtener consumo:", error);
      });

    fetch(`${API_BASE_URL}/cv/por-usuario`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setDataPorUsuario(data);
      })
      .catch((error) => {
        console.error("❌ Error al obtener datos por usuario:", error);
      });
  }, []);

  const restante = Math.max(CONSUMO_MAXIMO - consumo, 0);
  const porcentaje = Math.min((consumo / CONSUMO_MAXIMO) * 100, 100).toFixed(2);

  const data = [
    { name: "CVs usados", value: consumo },
    { name: "CVs restantes", value: restante },
  ];

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        backgroundColor: "#f9fafc",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2" }}
      >
        📊 Consumo de CVs Transformados
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
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
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ marginTop: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box mt={3}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ textAlign: "center" }}
              >
                Progreso mensual: {consumo} de {CONSUMO_MAXIMO} CVs ({porcentaje}% )
              </Typography>
              <MuiTooltip title={`${porcentaje}% utilizado`} arrow>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(porcentaje)}
                  sx={{
                    height: 12,
                    borderRadius: 5,
                    backgroundColor: "#eee",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#1976d2",
                    },
                  }}
                />
              </MuiTooltip>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              height: "100%",
              minHeight: 440,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataPorUsuario} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="usuario" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#1976d2" name="CVs Transformados" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
