import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir múltiplos submits
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await login(credentials);
      // Navegação após login bem-sucedido
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Erro no login:', err);
      // O erro já é tratado no AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                color: '#15803d',
                fontWeight: 700,
                mb: 1,
              }}
            >
              RMA Hospedagem
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              Sistema de Gerenciamento de Hardware
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuário"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              disabled={isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#22c55e',
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#22c55e',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#22c55e',
                fontWeight: 600,
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: '#16a34a',
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                }
              }}
              disabled={isSubmitting || !credentials.username || !credentials.password}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar no Sistema'}
            </Button>

            {/* Credenciais de teste */}
            <Box sx={{ 
              mt: 3, 
              textAlign: 'center',
              p: 2,
              backgroundColor: '#f0fdf4',
              borderRadius: 2,
              border: '1px solid #dcfce7',
            }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                Credenciais para teste:
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                Usuário: <strong>RMA</strong> | Senha: <strong>123</strong>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;