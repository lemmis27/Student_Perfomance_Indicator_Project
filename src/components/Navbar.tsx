import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" color="primary" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>Student Performance App</Typography>
        <Box>
          <Button component={Link} to="/" color="primary">Home</Button>
          {isLoggedIn && (
            <>
              <Button component={Link} to="/predict" color="primary">Predict</Button>
              <Button component={Link} to="/recommend" color="primary">Recommend</Button>
            </>
          )}
          {!isLoggedIn ? (
            <>
              <Button component={Link} to="/login" color="primary">Login</Button>
              <Button component={Link} to="/register" color="primary">Register</Button>
            </>
          ) : (
            <Button color="secondary" onClick={onLogout}>Logout</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 