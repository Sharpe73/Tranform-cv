import React from "react";
import { Box, Alert } from "@mui/material";

const MessageDisplay = ({ message }) => {
  const isSuccess = message.startsWith("✅");
  const severity = isSuccess ? "success" : "error";

  return (
    message && (
      <Box sx={{ mt: 3 }}>
        <Alert severity={severity}>{message}</Alert>
      </Box>
    )
  );
};

export default MessageDisplay;
