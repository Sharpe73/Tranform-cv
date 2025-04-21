import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CONSUMO_MAXIMO = 500;
const COLORS = ["#1976d2", "#e0e0e0"];

function Dashboard() {
  const [consumo, setConsumo] = useState(0);

  useEffect(() => {
    fetch("https://tranform-cv.onrender.com/cv/consumo")
      .then((res) => res.json())
      .then((data) => {
        setConsumo(data.total || 0);
      })
      .catch((error) => {
        console.error("Error al obtener consumo:", error);
      });
  }, []);

  const restante = Math.max(CONSUMO_MAXIMO - consumo, 0);
  const porcentaje = Math.min((consumo / CONSUMO_MAXIMO) * 100, 100).toFixed(2);

  const data = [
    { name: "CVs usados", value: consumo },
    { name: "CVs restantes", value: restante },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 Consumo de CVs Transformados
      </Typography>

      <Paper elevation={4} sx={{ p: 3, maxWidth: 600, margin: "auto" }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Progreso mensual: {consumo} de {CONSUMO_MAXIMO} CVs ({porcentaje}%)
          </Typography>
          <MuiTooltip title={`${porcentaje}% utilizado`} arrow>
            <LinearProgress
              variant="determinate"
              value={parseFloat(porcentaje)}
              sx={{
                height: 12,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#1976d2",
                },
              }}
            />
          </MuiTooltip>
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;
