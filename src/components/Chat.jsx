import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically scroll to bottom when conversation updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDeepSeekResponse = async (messages) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from DeepSeek API');
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const userMessage = message.trim();
    const updatedConversation = [...conversation, { role: 'user', content: userMessage }];
    setConversation(updatedConversation);
    setMessage('');
    setLoading(true);
    
    try {
      // Create messages array with conversation history
      const messages = updatedConversation.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const data = await getDeepSeekResponse(messages);
      const assistantResponse = data.choices[0].message.content;
      setConversation(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setConversation(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message || 'Could not get response from DeepSeek API'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      // Store API key in localStorage for persistence
      localStorage.setItem('deepseek-api-key', apiKey.trim());
      setApiKeySet(true);
    }
  };

  const resetApiKey = () => {
    localStorage.removeItem('deepseek-api-key');
    setApiKey('');
    setApiKeySet(false);
  };

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('deepseek-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeySet(true);
    }
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!apiKeySet) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography  variant="h5" component="h2" gutterBottom>
            DeepSeek Chat Setup
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Enter your API key to start using DeepSeek Chat
          </Typography>
          
          <TextField
            label="DeepSeek API Key"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary"
            fullWidth
            size="large"
            onClick={saveApiKey}
            sx={{ mt: 2 }}
            disabled={!apiKey.trim()}
          >
            Connect to DeepSeek API
          </Button>
          
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Note: Your API key is stored in your browser's local storage for convenience.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 2, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{border:"2px solid white", display: 'flex', flexDirection: 'column', height: '100%', backgroundColor:"#F6F8FA" }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <Typography sx={{display:"flex", justifyContent:"center"}}  variant="h6">DeepSeek Chat</Typography>
          <IconButton onClick={resetApiKey} size="small" title="Change API Key">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          minHeight: '300px',
          maxHeight: '500px'
        }}>
          {conversation.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Send a message to start chatting with DeepSeek
              </Typography>
            </Box>
          )}

          {conversation.map((msg, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Card 
                sx={{ 
                  maxWidth: '75%',
                  bgcolor: msg.role === 'user' 
                    ? 'primary.light' 
                    : msg.role === 'system'
                      ? 'error.light'
                      : 'secondary.light'
                }}
                variant="outlined"
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography 
                    variant="body1" 
                    
                    color={msg.role === 'user' ? 'primary.dark' : msg.role === 'system' ? 'error.dark' : 'text.primary'}
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.content}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Card variant="outlined" sx={{ maxWidth: '75%', bgcolor: 'grey.100' }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </CardContent>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              
              rows={2}
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={loading || !message.trim()}
              onClick={handleSendMessage}
              sx={{ alignSelf: 'flex-end',  }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};