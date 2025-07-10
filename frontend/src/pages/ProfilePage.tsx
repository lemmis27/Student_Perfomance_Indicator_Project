import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Button as MuiButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

type HistoryItem = {
  input: any;
  result: number;
  date: string;
};

const ProfilePage = ({
  username,
  history,
  onClearHistory,
}: {
  username: string;
  history: HistoryItem[];
  onClearHistory?: () => void;
}) => (
  <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
    <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, maxWidth: { xs: 340, sm: 700 } }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, mb: 1 }}>
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" color="primary" gutterBottom>
          {username}
        </Typography>
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Prediction History
      </Typography>
      {history.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No prediction history yet. Make a prediction to see your history here!
        </Typography>
      ) : (
        <>
          <Table role="table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Input</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>{h.date}</TableCell>
                  <TableCell>
                    <Box component="div">
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {(Object.entries(h.input) as [string, string | number | boolean][]).map(([k, v]) => (
                          <li key={k}>
                            <b>{k}:</b> {v}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </TableCell>
                  <TableCell>{h.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <a href="/recommend" style={{ textDecoration: "none" }}>
              <button aria-label="Go to Recommendation" style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '10px 24px',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
              }}>
                Go to Recommendation
              </button>
            </a>
            {onClearHistory && (
              <MuiButton variant="outlined" color="secondary" sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }} onClick={onClearHistory} fullWidth={true} aria-label="Clear History">
                Clear History
              </MuiButton>
            )}
          </Box>
        </>
      )}
    </Paper>
  </Box>
);

export default ProfilePage;
