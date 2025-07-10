import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import WarningIcon from '@mui/icons-material/Warning';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useRef } from 'react';

const getRecommendation = (score: number | null) => {
  if (score === null) return "No prediction yet. Please use the predictor first!";
  if (score >= 85) return "Excellent! Keep up the great work and help others.";
  if (score >= 70) return "Good job! Focus on your weaker areas for even better results.";
  if (score >= 50) return "You can improve! Try more practice and consider a test prep course.";
  return "Don't be discouraged. Seek help from teachers and practice regularly!";
};

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

// Accept history as a prop
type HistoryItem = { input: any; result: number; date: string };
interface RecommendationPageProps {
  score: number | null;
  history?: HistoryItem[];
}

const RecommendationPage = ({ score, history }: RecommendationPageProps) => {
  const theme = useTheme();
  const getScoreColor = (score: number | null) => {
    if (score === null) return theme.palette.text.secondary;
    if (score >= 85) return theme.palette.success.main;
    if (score >= 70) return theme.palette.primary.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  const getBarColor = (score: number | null) => {
    if (score === null) return '#bdbdbd';
    if (score >= 85) return theme.palette.success.main;
    if (score >= 70) return theme.palette.primary.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  const getScoreIcon = (score: number | null) => {
    if (score === null) return null;
    if (score >= 85) return <EmojiEventsIcon sx={{ color: theme.palette.success.main, fontSize: 36, ml: 1 }} titleAccess="Excellent" />;
    if (score >= 70) return <ThumbUpIcon sx={{ color: theme.palette.primary.main, fontSize: 36, ml: 1 }} titleAccess="Good" />;
    if (score >= 50) return <EmojiObjectsIcon sx={{ color: theme.palette.warning.main, fontSize: 36, ml: 1 }} titleAccess="Average" />;
    return <WarningIcon sx={{ color: theme.palette.error.main, fontSize: 36, ml: 1 }} titleAccess="Critical" />;
  };
  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'No prediction yet';
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Critical';
  };
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedColor, setAnimatedColor] = useState(theme.palette.text.secondary);
  const navigate = useNavigate();
  const [aiRecommendation, setAIRecommendation] = useState<string>("");
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string, time: string}[]>(() => {
    const stored = localStorage.getItem('chatHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Persist chat history to localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (history && history.length > 0) {
      setAILoading(true);
      setAIError("");
      fetch('http://localhost:8000/recommend/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: history.map(h => ({ result: h.result })) }),
      })
        .then(res => res.json())
        .then(data => {
          setAIRecommendation(data.recommendation);
          setAILoading(false);
        })
        .catch(() => {
          setAIError("Could not fetch AI recommendation.");
          setAILoading(false);
        });
    } else {
      setAIRecommendation("");
    }
  }, [history]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, {role: 'user', content: chatInput, time: now}]);
    try {
      const res = await fetch('http://localhost:8000/recommend/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          history: (history || []).map(h => ({ result: h.result })),
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

  const recommendationText = score !== null ? getRecommendation(score) : '';
  const handleCopy = () => {
    navigator.clipboard.writeText(recommendationText);
  };
  const handlePrint = () => {
    window.print();
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Study Recommendation',
        text: recommendationText,
        url: window.location.href
      });
    } else {
      handleCopy();
    }
  };

  const showHistory = history && history.length > 1;

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, maxWidth: { xs: 340, sm: 500 } }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Recommendations
        </Typography>
        <Box sx={{ width: "100%", height: 200, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ name: "Score", value: animatedValue ?? 0, fill: getBarColor(score) }]}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" />
            </RadialBarChart>
          </ResponsiveContainer>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
            <Tooltip title={getScoreLabel(score)} arrow>
              <Typography align="center" variant="h5" sx={{ color: animatedColor, fontWeight: 700, transition: 'color 0.4s', cursor: 'help' }}>
                {score !== null ? `${animatedValue}` : "--"}
              </Typography>
            </Tooltip>
            {getScoreIcon(score)}
          </Box>
        </Box>
        {/* Color Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 6, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.success.main, borderRadius: '50%' }} />
            <Typography variant="caption">Excellent (≥ 85)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.primary.main, borderRadius: '50%' }} />
            <Typography variant="caption">Good (70–84)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.warning.main, borderRadius: '50%' }} />
            <Typography variant="caption">Average (50–69)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.error.main, borderRadius: '50%' }} />
            <Typography variant="caption">Critical (&lt; 50)</Typography>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, mt: 4 }}>
          {getRecommendation(score)}
        </Typography>
        {score !== null && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              aria-label="Copy Recommendation"
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              aria-label="Print Recommendation"
            >
              Print
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              aria-label="Share Recommendation"
            >
              Share
            </Button>
          </Box>
        )}
        {/* AI Recommendation Section */}
        {history && history.length > 0 && (
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              AI Recommendation
            </Typography>
            {aiLoading ? (
              <CircularProgress size={24} />
            ) : aiError ? (
              <Typography color="error">{aiError}</Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">{aiRecommendation}</Typography>
            )}
          </Box>
        )}
        {/* AI Chat Section */}
        {history && history.length > 0 && (
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Ask the AI for personalized advice
            </Typography>
            <Box ref={chatBoxRef} sx={{ maxHeight: 200, overflowY: 'auto', mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 2 }}>
              {chatHistory.map((msg, idx) => (
                <React.Fragment key={idx}>
                  <Box
                    sx={{
                      mb: 1,
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 1,
                    }}
                    aria-label={msg.role === 'user' ? 'User message' : 'AI message'}
                  >
                    {msg.role === 'user' ? <PersonIcon color="primary" /> : <SmartToyIcon color="secondary" />}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          bgcolor: msg.role === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.mode === 'dark'
                              ? theme.palette.background.paper
                              : 'grey.100',
                          color: msg.role === 'user'
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          px: 2,
                          py: 1,
                          borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          boxShadow: 1,
                          maxWidth: { xs: '80vw', sm: 400 },
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {msg.time}
                      </Typography>
                    </Box>
                  </Box>
                </React.Fragment>
              ))}
              {chatLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SmartToyIcon color="secondary" />
                  <Box sx={{ bgcolor: 'grey.100', px: 2, py: 1, borderRadius: '4px 16px 16px 16px', boxShadow: 1, fontStyle: 'italic', color: 'text.secondary', fontSize: 14 }}>
                    <span>
                      AI is typing
                      <span className="typing-dots">...</span>
                    </span>
                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                placeholder="Type your question..."
                style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                disabled={chatLoading}
                autoFocus
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                aria-label="Send"
                tabIndex={0}
              >
                Send
              </Button>
            </Box>
          </Box>
        )}
        {/* Past Recommendations History */}
        {showHistory && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Past Recommendations
            </Typography>
            {history!.slice(0, -1).reverse().map((h, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.background.paper, boxShadow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {h.date}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" sx={{ color: getScoreColor(h.result), fontWeight: 700 }}>
                    {h.result}
                  </Typography>
                  {getScoreIcon(h.result)}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {getRecommendation(h.result)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
          Helpful Resources:
        </Typography>
        <ul>
          {resources.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                {r.label}
              </a>
            </li>
          ))}
        </ul>
        <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
          Motivational Tips:
        </Typography>
        <ul>
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button variant="outlined" color="primary" onClick={() => navigate("/profile")}
            aria-label="Back to Profile">
            Back to Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RecommendationPage;
