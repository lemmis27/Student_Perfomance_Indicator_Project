import React from "react";
import { Typography, Box, Paper } from "@mui/material";

const getRecommendation = (score: number | null) => {
  if (score === null) return "No prediction yet. Please use the predictor first!";
  if (score >= 85) return "Excellent! Keep up the great work and help others.";
  if (score >= 70) return "Good job! Focus on your weaker areas for even better results.";
  if (score >= 50) return "You can improve! Try more practice and consider a test prep course.";
  return "Don't be discouraged. Seek help from teachers and practice regularly!";
};

const RecommendationPage = ({ score }: { score: number | null }) => (
  <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
    <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 500 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Recommendations
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {getRecommendation(score)}
      </Typography>
    </Paper>
  </Box>
);

export default RecommendationPage; 