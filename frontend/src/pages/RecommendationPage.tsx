import React, { useEffect, useState, useRef } from "react";
import {
  Typography, Box, Paper, Button, Avatar, Tooltip, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText, Popover, CircularProgress, LinearProgress, Container, Grid, Stack, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import Confetti from 'react-confetti';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

const resources = [
  { label: "Khan Academy", url: "https://www.khanacademy.org/" },
  { label: "Coursera Study Skills", url: "https://www.coursera.org/courses?query=study%20skills" },
  { label: "EdX Test Prep", url: "https://www.edx.org/learn/test-preparation" },
];

const tips = [
  "Set small, achievable goals each week.",
  "Review your mistakes and learn from them.",
  "Ask for help when you need it.",
  "Practice regularly, not just before exams.",
];

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Believe you can and you're halfway there.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
];
const quote = quotes[new Date().getDate() % quotes.length];

type HistoryItem = { input: any; result: number; date: string };
interface RecommendationPageProps {
  history?: HistoryItem[];
}

const getRecommendation = (score: number | null) => {
  if (score === null) return "No prediction yet. Please use the predictor first!";
  if (score >= 85) return "Excellent! Keep up the great work and help others.";
  if (score >= 70) return "Good job! Focus on your weaker areas for even better results.";
  if (score >= 50) return "You can improve! Try more practice and consider a test prep course.";
  return "Don't be discouraged. Seek help from teachers and practice regularly!";
};

const getNextStep = (score: number | null) => {
  if (score === null) return "Make a prediction to get started!";
  if (score >= 85) return "Keep up the great work! Try helping a friend or challenging yourself with harder problems.";
  if (score >= 70) return "Focus on your weaker areas for even better results.";
  if (score >= 50) return "Try more practice and consider a test prep course.";
  return "Don't be discouraged. Seek help from teachers and practice regularly!";
};

const getScoreColor = (score: number | null, theme: any) => {
  if (score === null) return theme.palette.text.secondary;
  if (score >= 85) return theme.palette.success.main;
  if (score >= 70) return theme.palette.primary.main;
  if (score >= 50) return theme.palette.warning.main;
  return theme.palette.error.main;
};
const getScoreIcon = (score: number | null, theme: any) => {
  if (score === null) return null;
  if (score >= 85) return <EmojiEventsIcon sx={{ color: theme.palette.success.main, fontSize: 36, ml: 1 }} titleAccess="Excellent" />;
  if (score >= 70) return <EmojiEmotionsIcon sx={{ color: theme.palette.primary.main, fontSize: 36, ml: 1 }} titleAccess="Good" />;
  if (score >= 50) return <EmojiEmotionsIcon sx={{ color: theme.palette.warning.main, fontSize: 36, ml: 1 }} titleAccess="Average" />;
  return <EmojiEmotionsIcon sx={{ color: theme.palette.error.main, fontSize: 36, ml: 1 }} titleAccess="Critical" />;
};

const getStreak = (history: HistoryItem[]) => {
  if (!history || history.length === 0) return 0;
  let streak = 1;
  for (let i = history.length - 1; i > 0; i--) {
    const today = new Date(history[i].date);
    const prev = new Date(history[i - 1].date);
    if ((today.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) streak++;
    else break;
  }
  return streak;
};

const RecommendationPage = ({ history }: RecommendationPageProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedColor, setAnimatedColor] = useState(theme.palette.text.secondary);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dropdownSection, setDropdownSection] = useState<'recommendations' | 'resources' | 'tips' | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string, time: string}[]>(() => {
    const stored = localStorage.getItem('chatHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Add state for chat menu
  const [chatMenuAnchorEl, setChatMenuAnchorEl] = useState<null | HTMLElement>(null);
  // Add state for view history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Score logic
  let score: number | null = null;
  if (history && history.length > 0) {
    score = history[history.length - 1].result;
  }

  // Progress chart data
  const progressData = (history || []).map((h, idx) => ({
    name: h.date || `#${idx + 1}`,
    score: h.result,
  }));

  // Best/Average/Worst
  const scores = (history || []).map(h => h.result);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const worstScore = scores.length ? Math.min(...scores) : null;
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  const streak = getStreak(history || []);

  // Achievement badges
  const badges = [
    { label: "5 Predictions", achieved: history && history.length >= 5, emoji: "📝" },
    { label: "3-Day Streak", achieved: streak >= 3, emoji: "🔥" },
    { label: "Score 90+", achieved: bestScore && bestScore >= 90, emoji: "🏅" },
  ];

  // Progress bar toward goal
  const targetScore = 90;
  const progress = score ? Math.min((score / targetScore) * 100, 100) : 0;

  // Animated score effect
  useEffect(() => {
    if (score !== null && !isNaN(score)) {
      let start = animatedValue;
      let end = score;
      let duration = 800;
      let startTime: number | null = null;
      if (start === end) {
        setAnimatedValue(end);
        setAnimatedColor(getScoreColor(end, theme));
        return;
      }
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.round(start + (end - start) * progress);
        setAnimatedValue(value);
        setAnimatedColor(getScoreColor(value, theme));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    } else {
      setAnimatedValue(0);
      setAnimatedColor(theme.palette.text.secondary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, theme]);

  // Confetti on new best score
  useEffect(() => {
    if (score && score === bestScore && score !== 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [score, bestScore]);

  // Dropdown logic
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setDropdownSection(null);
  };
  const handleDropdownSelect = (section: 'recommendations' | 'resources' | 'tips') => {
    setDropdownSection(section);
  };

  // Chat logic
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, {role: 'user', content: chatInput, time: now}]);
    try {
      const chat_history = [
        ...chatHistory,
        { role: 'user', content: chatInput, time: now }
      ];
      const res = await fetch('http://localhost:8000/recommend/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          history: (history || []).map(h => ({ result: h.result })),
          chat_history: chat_history,
          question: chatInput
        })
      });
      const data = await res.json();
      const aiNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, {role: 'ai', content: data.answer, time: aiNow}]);
    } catch {
      const aiNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, {role: 'ai', content: 'Sorry, I could not get a response.', time: aiNow}]);
    }
    setChatInput('');
    setChatLoading(false);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 0);
  };

  // User info
  const username = localStorage.getItem('currentUser') || 'User';

  // Handle chat menu
  const handleChatMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setChatMenuAnchorEl(event.currentTarget);
  };
  const handleChatMenuClose = () => {
    setChatMenuAnchorEl(null);
  };
  const handleClearChat = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    handleChatMenuClose();
  };
  const handleDownloadChat = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatHistory, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "chat_history.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    handleChatMenuClose();
  };
  const handleViewHistory = () => {
    setHistoryDialogOpen(true);
    handleChatMenuClose();
  };
  const handleCloseHistoryDialog = () => setHistoryDialogOpen(false);

  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <IconButton
          color="primary"
          onClick={handleMenuOpen}
          aria-label="Open dashboard"
          size="large"
        >
          <DashboardIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 400,
              maxWidth: "90vw",
              p: 2,
              borderRadius: 3,
              boxShadow: 6,
            },
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Score Progress
            </Typography>
            <Box sx={{ height: 200, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="score" stroke="#1976d2" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Best</Typography>
                  <Typography variant="h6" color="success.main">
                    {bestScore}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Average</Typography>
                  <Typography variant="h6" color="primary.main">
                    {avgScore}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Lowest</Typography>
                  <Typography variant="h6" color="error.main">
                    {worstScore}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Streak: <b>{streak}</b> days
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((streak / 7) * 100, 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {streak >= 7
                  ? "Amazing! You've kept up a week-long streak!"
                  : `Keep going! ${7 - streak} days to a 7-day streak badge.`}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Achievements
              </Typography>
              <Stack direction="row" spacing={1}>
                {badges.map((badge, idx) => (
                  <Tooltip key={idx} title={badge.label}>
                    <span>
                      <Avatar
                        sx={{
                          bgcolor: badge.achieved
                            ? "primary.main"
                            : "grey.300",
                          width: 40,
                          height: 40,
                          opacity: badge.achieved ? 1 : 0.5,
                        }}
                      >
                        {badge.emoji}
                      </Avatar>
                    </span>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Motivational Quote
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, fontStyle: "italic", bgcolor: "grey.100" }}
              >
                "{quote}"
              </Paper>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Actionable Next Steps
              </Typography>
              <List dense>
                {tips.map((tip, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircleOutline color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quick Links
              </Typography>
              <Stack direction="row" spacing={2}>
                {resources.map((resource, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    color="primary"
                    size="small"
                    href={resource.url}
                    target="_blank"
                    startIcon={<LinkIcon />}
                  >
                    {resource.label}
                  </Button>
                ))}
              </Stack>
            </Box>
            {showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={300}
              />
            )}
          </Box>
        </Menu>
      </Box>
      {/* Animated Score Chart and Recommendation */}
      <Box sx={{ width: '100%', height: 220, mb: 3, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={[{ name: 'Score', value: animatedValue ?? 0, fill: getScoreColor(score, theme) }]}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Centered score and icon overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <Tooltip title={getRecommendation(score)} arrow>
            <Typography align="center" variant="h2" sx={{ color: getScoreColor(score, theme), fontWeight: 700, transition: 'color 0.4s', cursor: 'help', lineHeight: 1, pointerEvents: 'auto' }}>
              {score !== null ? `${animatedValue}` : "--"}
            </Typography>
          </Tooltip>
          <Box sx={{ mt: 1 }}>{getScoreIcon(score, theme)}</Box>
        </Box>
      </Box>
      {/* Recommendation text */}
      <Typography align="center" variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        {getRecommendation(score)}
      </Typography>
      {/* Dashboard Dropdown - detailed */}
      <Box sx={{ maxWidth: 540, mx: 'auto', mb: 2 }}>
        <IconButton
          color="primary"
          onClick={handleMenuOpen}
          aria-label="Open dashboard"
          size="large"
          sx={{ float: 'right', mb: 1 }}
        >
          <DashboardIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 400,
              maxWidth: "90vw",
              p: 2,
              borderRadius: 3,
              boxShadow: 6,
            },
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Score Progress
            </Typography>
            <Box sx={{ height: 200, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="score" stroke="#1976d2" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Best</Typography>
                  <Typography variant="h6" color="success.main">
                    {bestScore}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Average</Typography>
                  <Typography variant="h6" color="primary.main">
                    {avgScore}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">Lowest</Typography>
                  <Typography variant="h6" color="error.main">
                    {worstScore}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Streak: <b>{streak}</b> days
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((streak / 7) * 100, 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {streak >= 7
                  ? "Amazing! You've kept up a week-long streak!"
                  : `Keep going! ${7 - streak} days to a 7-day streak badge.`}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Achievements
              </Typography>
              <Stack direction="row" spacing={1}>
                {badges.map((badge, idx) => (
                  <Tooltip key={idx} title={badge.label}>
                    <span>
                      <Avatar
                        sx={{
                          bgcolor: badge.achieved ? "primary.main" : "grey.300",
                          width: 40,
                          height: 40,
                          opacity: badge.achieved ? 1 : 0.5,
                        }}
                      >
                        {badge.emoji}
                      </Avatar>
                    </span>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Motivational Quote
              </Typography>
              <Paper elevation={1} sx={{ p: 2, fontStyle: "italic", bgcolor: "grey.100" }}>
                "{quote}"
              </Paper>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Actionable Next Steps
              </Typography>
              <List dense>
                {tips.map((tip, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircleOutline color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quick Links
              </Typography>
              <Stack direction="row" spacing={2}>
                {resources.map((resource, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    color="primary"
                    size="small"
                    href={resource.url}
                    target="_blank"
                    startIcon={<LinkIcon />}
                  >
                    {resource.label}
                  </Button>
                ))}
              </Stack>
            </Box>
            {showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={300}
              />
            )}
          </Box>
        </Menu>
      </Box>
      {/* Chat area and input - detailed */}
      <Box sx={{ maxWidth: 540, mx: 'auto', mt: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h4" sx={{ mb: 0 }}>
            Ask AI Recommendations
          </Typography>
          <IconButton
            size="small"
            onClick={handleChatMenuOpen}
            aria-label="Chat actions"
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={chatMenuAnchorEl}
            open={Boolean(chatMenuAnchorEl)}
            onClose={handleChatMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            MenuListProps={{ sx: { minWidth: 180 } }}
            PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
          >
            <MenuItem onClick={handleViewHistory} sx={{ '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' } }}>View History</MenuItem>
            <MenuItem onClick={handleClearChat} sx={{ '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}>Clear Chat</MenuItem>
            <MenuItem onClick={handleDownloadChat}>Download Chat History</MenuItem>
          </Menu>
        </Box>
        <Paper sx={{ maxHeight: 220, minHeight: 80, overflowY: "auto", mb: 2, p: 1, position: 'relative', borderRadius: 2, boxShadow: 4 }} ref={chatBoxRef}>
          {chatHistory.map((msg, idx) => (
            <Box
              key={idx}
              display="flex"
              flexDirection={msg.role === "user" ? "row-reverse" : "row"}
              alignItems="flex-end"
              mb={1}
              gap={1}
            >
              {/* Avatar */}
              <Avatar sx={{ bgcolor: msg.role === "user" ? 'primary.main' : 'grey.300', color: msg.role === "user" ? 'primary.contrastText' : 'text.primary', width: 32, height: 32, fontSize: 18 }}>
                {msg.role === "user"
                  ? (username[0]?.toUpperCase() || <PersonIcon fontSize="small" />)
                  : <SmartToyIcon fontSize="small" />}
              </Avatar>
              {/* Chat bubble */}
              <Box
                sx={{
                  bgcolor: msg.role === "user"
                    ? 'primary.main'
                    : theme.palette.background.paper,
                  color: msg.role === "user"
                    ? 'primary.contrastText'
                    : theme.palette.text.primary,
                  px: 2,
                  py: 1,
                  borderRadius: msg.role === "user" ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  boxShadow: 1,
                  maxWidth: { xs: '80vw', sm: 400 },
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          ))}
          {chatLoading && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar sx={{ bgcolor: 'grey.300', color: 'text.primary', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Box sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.secondary, px: 2, py: 1, borderRadius: '4px 16px 16px 16px', boxShadow: 1, fontStyle: 'italic', fontSize: 14 }}>
                <span>AI is typing...</span>
              </Box>
            </Box>
          )}
        </Paper>
        <Divider sx={{ maxWidth: 540, mx: 'auto', mb: 1 }} />
        <Box display="flex" gap={1} alignItems="center" sx={{ maxWidth: 540, mx: 'auto', mb: 1 }}>
          <input
            ref={chatInputRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 24,
              border: "1px solid #ccc",
              fontSize: 16,
              outline: 'none',
              background: '#fafbfc',
            }}
            placeholder="Type your question..."
            onKeyDown={e => {
              if (e.key === "Enter") handleSendChat();
            }}
            disabled={chatLoading}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendChat}
            disabled={chatLoading || !chatInput.trim()}
            sx={{ borderRadius: 24, minWidth: 48, height: 48 }}
            aria-label="Send"
            tabIndex={0}
          >
            Send
          </Button>
        </Box>
      </Box>
      {/* View History Dialog */}
      <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chat History</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 400 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', minHeight: 120 }}>
            {chatHistory.length === 0 ? (
              <Typography color="text.secondary">No chat history yet.</Typography>
            ) : (
              chatHistory.map((msg, idx) => (
                <Box key={idx} display="flex" alignItems="flex-start" mb={1} gap={1}>
                  <Avatar sx={{ bgcolor: msg.role === "user" ? 'primary.main' : 'grey.300', color: msg.role === "user" ? 'primary.contrastText' : 'text.primary', width: 24, height: 24, fontSize: 13 }}>
                    {msg.role === "user"
                      ? (username[0]?.toUpperCase() || <PersonIcon fontSize="small" />)
                      : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>{msg.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {msg.time}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary" autoFocus>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecommendationPage;