import React, { useState, useEffect } from "react";
import { Box, Alert } from "@mui/material";

const MessageDisplay = ({ message }) => {
  const [open, setOpen] = useState(!!message);

  useEffect(() => {
    setOpen(!!message);
  }, [message]);

  let severity = "info";

  if (message?.startsWith("✅")) {
    severity = "success";
  } else if (message?.startsWith("❌")) {
    severity = "error";
  } else if (message?.startsWith("⚠️")) {
    severity = "warning";
  }

  return (
    open &&
    message && (
      <Box sx={{ mt: 3 }}>
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Box>
    )
  );
};

export default MessageDisplay;
