import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PredictPage from "./pages/PredictPage";
import RecommendationPage from "./pages/RecommendationPage";
import ProfilePage from "./pages/ProfilePage";

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: { main: "#1976d2" },
    secondary: { main: "#d32f2f" },
    background: {
      default: mode === "light" ? "#f4f6fa" : "#181c24",
      paper: mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(30,34,44,0.7)",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        },
      },
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [users, setUsers] = useState<{ [username: string]: string }>({});
  const [lastPrediction, setLastPrediction] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("currentUser") || "");
  const [history, setHistory] = useState<any[]>(() => {
    const stored = localStorage.getItem("history");
    return stored ? JSON.parse(stored) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? stored === "true" : false;
  });

  // Persist history to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const theme = React.useMemo(() => createTheme(getDesignTokens(darkMode ? "dark" : "light")), [darkMode]);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", username);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
  };
  const handleRegister = (username: string) => setUsers({ ...users, [username]: "registered" });

  // Update history when a prediction is made
  const handlePredict = (result: number, input: any) => {
    setLastPrediction(result);
    setHistory((prev) => [
      ...prev,
      {
        input,
        result,
        date: new Date().toLocaleDateString(),
      },
    ]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} username={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
          <Route
            path="/predict"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <PredictPage onPredict={handlePredict} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommend"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RecommendationPage score={lastPrediction} history={history} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProfilePage username={currentUser} history={history} onClearHistory={() => setHistory([])} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;