import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor={theme.palette.background.default}
      px={2}
    >
      <Typography
        variant="h2"
        fontWeight={700}
        textAlign="center"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          mb: 2,
        }}
      >
        Student Performance Predictor
      </Typography>

      <TypeAnimation
        sequence={[
          "Unlock your academic potential.",
          2000,
          "Get personalized study recommendations.",
          2000,
          "Predict your performance with AI.",
          2000,
        ]}
        wrapper="span"
        speed={50}
        style={{
          fontSize: "1.5rem",
          display: "inline-block",
          color: theme.palette.text.secondary,
          marginBottom: "2rem",
          textAlign: "center",
        }}
        repeat={Infinity}
        cursor={true}
      />

      <Box mt={4}>
        <Button
          component={Link}
          to="/predict"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mr: 2 }}
        >
          Get Started
        </Button>
        <Button
          component={Link}
          to="/register"
          variant="outlined"
          color="primary"
          size="large"
        >
          Register
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
