import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegisterPage = ({ onRegister }: { onRegister: (username: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!username || !password) {
      setError("Please enter both username and password.");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }
    // Demo: only accept username !== 'taken' for valid registration
    if (username === "taken") {
      setError("Username already taken. Please choose another.");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }
    await new Promise(res => setTimeout(res, 800)); // simulate network
    onRegister(username);
    setLoading(false);
    navigate("/login");
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" color="primary" gutterBottom align="center">
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
          />
          <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterPage;