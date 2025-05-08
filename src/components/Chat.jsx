import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import KeyIcon from '@mui/icons-material/Key';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(true);
  const [keyError, setKeyError] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyChange = (e) => {
    setApiKey(e.target.value);
    setKeyError('');
  };

  const handleKeySubmit = () => {
    if (!apiKey.trim()) {
     
      return;
    }
    setIsKeyDialogOpen(false);
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
          model: 'deepseek/deepseek-r1-distill-qwen-14b:free',
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
    if (!message.trim() || loading || !apiKey) return;
    
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
      
      // If we get an authentication error, prompt for new API key
      if (error.message && (error.message.includes('authentication') || error.message.includes('API key') || error.message.includes('unauthorized'))) {
        setIsKeyDialogOpen(true);
      }
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

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 2, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{border:"2px solid white", display: 'flex', flexDirection: 'column', height: '100%', backgroundColor:"#F6F8FA" }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">DeepSeek Chat</Typography>
          
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
                {apiKey ? 'Send a message to start chatting with DeepSeek' : 'Please enter your API key to start'}
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
              disabled={!apiKey}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={loading || !message.trim() || !apiKey}
              onClick={handleSendMessage}
              sx={{ alignSelf: 'flex-end' }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* API Key Dialog */}
      <Dialog 
        open={isKeyDialogOpen} 
        onClose={() => apiKey && setIsKeyDialogOpen(false)}
        disableEscapeKeyDown={!apiKey}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Open Router API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {keyError && <Alert severity="error" sx={{ mb: 2 }}>{keyError}</Alert>}
            
            <TextField
              autoFocus
              margin="dense"
              label="API Key"
              type="password"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={handleKeyChange}
              placeholder="sk-..."
              error={!!keyError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeySubmit} variant="contained" color="primary">
            Save Key
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};