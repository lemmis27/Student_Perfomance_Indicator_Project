import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Tooltip } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, onLogout, username, darkMode, setDarkMode }: {
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutClick = () => setLogoutOpen(true);
  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    onLogout();
  };
  const handleLogoutCancel = () => setLogoutOpen(false);

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" color="primary" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>Student Performance App</Typography>
        <Box display="flex" alignItems="center" sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button component={Link} to="/" color="primary" aria-label="Home">Home</Button>
          {isLoggedIn && (
            <>
              <Button component={Link} to="/predict" color="primary" aria-label="Predict">Predict</Button>
              <Button component={Link} to="/recommend" color="primary" aria-label="Recommend">Recommend</Button>
              <Button component={Link} to="/profile" color="primary" aria-label="Profile">Profile</Button>
              {username && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
                  {username}
                </Typography>
              )}
            </>
          )}
          {!isLoggedIn ? (
            <Button component={Link} to="/login" color="primary" aria-label="Login">Login</Button>
          ) : (
            <>
              <Button color="secondary" onClick={handleLogoutClick} aria-label="Logout">Logout</Button>
              <Dialog open={logoutOpen} onClose={handleLogoutCancel}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to log out?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleLogoutCancel} color="primary">Cancel</Button>
                  <Button onClick={handleLogoutConfirm} color="secondary">Logout</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
          {!isLoggedIn && (
            <Button component={Link} to="/register" color="primary" aria-label="Register">Register</Button>
          )}
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              color="primary"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setDarkMode(!darkMode)}
              sx={{ ml: { xs: 0, sm: 2 } }}
            >
              {darkMode ? <WbSunnyIcon /> : <NightlightIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
