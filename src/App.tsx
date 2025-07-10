import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PredictPage from "./pages/PredictPage";
import RecommendationPage from "./pages/RecommendationPage";
import ProfilePage from "./pages/ProfilePage";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<{ [username: string]: string }>({});
  const [username, setUsername] = useState("");
  const [lastPrediction, setLastPrediction] = useState<number | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<{ input: any; result: number; date: string }[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? JSON.parse(stored) : false;
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogin = (user?: string) => {
    setIsLoggedIn(true);
    if (user) setUsername(user);
  };
  const handleLogout = () => setLogoutDialogOpen(true);
  const confirmLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setLogoutDialogOpen(false);
  };
  const cancelLogout = () => setLogoutDialogOpen(false);
  const handleRegister = (user: string) => setUsers({ ...users, [user]: "registered" });

  const handlePredict = (score: number, input: any) => {
    setLastPrediction(score);
    setPredictionHistory([
      ...predictionHistory,
      { input, result: score, date: new Date().toLocaleString() },
    ]);
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route
          path="/predict"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <PredictPage onPredict={(score, input) => handlePredict(score, input)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommend"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <RecommendationPage score={lastPrediction} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ProfilePage username={username} history={predictionHistory} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Dialog open={logoutDialogOpen} onClose={cancelLogout} aria-labelledby="logout-dialog-title">
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">Cancel</Button>
          <Button onClick={confirmLogout} color="secondary">Logout</Button>
        </DialogActions>
      </Dialog>
    </Router>
  );
}

export default App; 