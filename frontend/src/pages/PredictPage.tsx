import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Divider,
  IconButton,
  Paper,
  Switch,
  AppBar,
  Toolbar,
  useMediaQuery,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import PersonIcon from "@mui/icons-material/Person";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SchoolIcon from "@mui/icons-material/School";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CalculateIcon from "@mui/icons-material/Calculate";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Confetti from "react-confetti";
import { TypeAnimation } from 'react-type-animation';

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const raceOptions = [
  { value: "group A", label: "Group A" },
  { value: "group B", label: "Group B" },
  { value: "group C", label: "Group C" },
  { value: "group D", label: "Group D" },
  { value: "group E", label: "Group E" },
];

const parentalEducationOptions = [
  { value: "some high school", label: "Some High School" },
  { value: "high school", label: "High School" },
  { value: "some college", label: "Some College" },
  { value: "associate's degree", label: "Associate's Degree" },
  { value: "bachelor's degree", label: "Bachelor's Degree" },
  { value: "master's degree", label: "Master's Degree" },
];

const lunchOptions = [
  { value: "standard", label: "Standard" },
  { value: "free/reduced", label: "Free/Reduced" },
];

const testPrepOptions = [
  { value: "none", label: "None" },
  { value: "completed", label: "Completed" },
];

type FormState = {
  gender: string;
  race_ethnicity: string;
  parental_level_of_education: string;
  lunch: string;
  test_preparation_course: string;
  math_score: string;
  reading_score: string;
  writing_score: string;
};

const initialState: FormState = {
  gender: "",
  race_ethnicity: "",
  parental_level_of_education: "",
  lunch: "",
  test_preparation_course: "",
  math_score: "",
  reading_score: "",
  writing_score: "",
};

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

type PredictPageProps = {
  onPredict?: (result: number, input: any) => void;
};

const PredictPage = ({ onPredict }: PredictPageProps) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? stored === "true" : false;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, []);

  // Persist darkMode to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(darkMode ? "dark" : "light")),
    [darkMode]
  );

  const validate = (field: keyof FormState, value: string) => {
    let error = "";
    if (!value) error = "Required";
    if (["math_score", "reading_score", "writing_score"].includes(field)) {
      const num = Number(value);
      if (value && (isNaN(num) || num < 0 || num > 100)) error = "Enter a number 0-100";
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validate(name as keyof FormState, value) });
  };

  const handleReset = () => {
    setForm(initialState);
    setErrors({});
    setPrediction(null);
    setShowConfetti(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Partial<FormState> = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      const error = validate(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setPrediction(null);
    setSnackbar({ open: false, message: "", severity: "success" });
    setShowConfetti(false);
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: form.gender,
          race_ethnicity: form.race_ethnicity,
          parental_level_of_education: form.parental_level_of_education,
          lunch: form.lunch,
          test_preparation_course: form.test_preparation_course,
          math_score: parseFloat(form.math_score),
          reading_score: parseFloat(form.reading_score),
          writing_score: parseFloat(form.writing_score),
        }),
      });
      if (!response.ok) throw new Error("Prediction failed. Please try again.");
      const data = await response.json();
      setPrediction(data.prediction);
      setSnackbar({ open: true, message: "Prediction successful!", severity: "success" });
      setShowConfetti(true);
      if (onPredict) {
        onPredict(data.prediction, form);
      }
      setTimeout(() => {
        navigate('/recommend');
      }, 1200); // short delay to show confetti/snackbar
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Prediction failed. Please try again.", severity: "error" });
    }
    setLoading(false);
  };

  // Responsive confetti
  const [windowSize, setWindowSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        }}
      >
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" color="primary">
              Student Performance Predictor
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <WbSunnyIcon color={darkMode ? "disabled" : "primary"} />
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode((prev) => !prev)}
                inputProps={{ "aria-label": "toggle dark mode" }}
                color="default"
              />
              <NightlightIcon color={darkMode ? "primary" : "disabled"} />
            </Box>
          </Toolbar>
          {loading && <LinearProgress color="primary" />}
        </AppBar>
        <Container maxWidth="sm" sx={{ py: 5 }}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 4 },
              mt: 4,
              mb: 2,
              background: theme.palette.background.paper,
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              autoComplete="off"
            >
              <TextField
                select
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender || "Select the student's gender."}
                required
                inputRef={firstFieldRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Race/Ethnicity"
                name="race_ethnicity"
                value={form.race_ethnicity}
                onChange={handleChange}
                error={!!errors.race_ethnicity}
                helperText={errors.race_ethnicity || "Select the student's race/ethnicity group."}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Diversity3Icon />
                    </InputAdornment>
                  ),
                }}
              >
                {raceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Parental Level of Education"
                name="parental_level_of_education"
                value={form.parental_level_of_education}
                onChange={handleChange}
                error={!!errors.parental_level_of_education}
                helperText={errors.parental_level_of_education || "Highest education level of the parent."}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {parentalEducationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Lunch"
                name="lunch"
                value={form.lunch}
                onChange={handleChange}
                error={!!errors.lunch}
                helperText={errors.lunch || "Type of lunch provided."}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LunchDiningIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {lunchOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Test Preparation Course"
                name="test_preparation_course"
                value={form.test_preparation_course}
                onChange={handleChange}
                error={!!errors.test_preparation_course}
                helperText={errors.test_preparation_course || "Has the student completed a test prep course?"}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AutoStoriesIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {testPrepOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Math Score"
                name="math_score"
                type="number"
                value={form.math_score}
                onChange={handleChange}
                error={!!errors.math_score}
                helperText={errors.math_score || "Enter a score between 0 and 100."}
                required
                inputProps={{ min: 0, max: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalculateIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Reading Score"
                name="reading_score"
                type="number"
                value={form.reading_score}
                onChange={handleChange}
                error={!!errors.reading_score}
                helperText={errors.reading_score || "Enter a score between 0 and 100."}
                required
                inputProps={{ min: 0, max: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MenuBookIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Writing Score"
                name="writing_score"
                type="number"
                value={form.writing_score}
                onChange={handleChange}
                error={!!errors.writing_score}
                helperText={errors.writing_score || "Enter a score between 0 and 100."}
                required
                inputProps={{ min: 0, max: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditNoteIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ flex: 1 }}
                  aria-label="predict"
                >
                  {loading ? <CircularProgress size={24} /> : "Predict"}
                </Button>
                <IconButton
                  color="secondary"
                  onClick={handleReset}
                  aria-label="reset"
                  sx={{ border: 1, borderColor: "secondary.main", borderRadius: 2 }}
                  disabled={loading}
                >
                  <RestartAltIcon />
                </IconButton>
              </Box>
            </Box>
            {prediction !== null && Object.keys(errors).length === 0 && (
              <Card
                sx={{
                  mt: 4,
                  bgcolor: darkMode ? "#232526" : "#e3f2fd",
                  borderRadius: 2,
                  boxShadow: 2,
                  animation: "fadeIn 1s",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(40px)" },
                    to: { opacity: 1, transform: "none" },
                  },
                }}
                aria-live="polite"
              >
                <CardContent>
                  <Typography variant="h5" align="center" color="primary">
                    🎯 Predicted Performance Score
                  </Typography>
                  <Typography variant="h2" align="center" color="secondary">
                    {prediction}
                  </Typography>
                </CardContent>
              </Card>
            )}
            {showConfetti && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={350}
                gravity={0.2}
                initialVelocityY={10}
              />
            )}
          </Paper>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Powered by FastAPI & Machine Learning
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PredictPage;
