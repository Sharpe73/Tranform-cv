import React from "react";
import { Alert, Box } from "@mui/material";

function MessageDisplay({ message }) {
  const isError = message.startsWith("❌") || message.includes("límite") || message.includes("Error");

  return (
    <Box sx={{ mt: 3, maxWidth: 500, mx: "auto" }}>
      <Alert severity={isError ? "error" : "info"}>
        {message}
      </Alert>
    </Box>
  );
}

export default MessageDisplay;
