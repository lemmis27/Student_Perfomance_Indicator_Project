import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}>
    <Paper elevation={6} sx={{ p: 4, borderRadius: 3, maxWidth: 500, textAlign: "center", background: "rgba(255,255,255,0.8)" }}>
      <Typography variant="h3" color="primary" gutterBottom>
        Welcome!
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Predict student performance and get personalized recommendations.
      </Typography>
      <Button component={Link} to="/predict" variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
        Get Started
      </Button>
    </Paper>
  </Box>
);

export default LandingPage; 