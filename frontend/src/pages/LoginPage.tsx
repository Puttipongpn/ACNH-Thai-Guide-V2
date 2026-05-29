import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { Link as RouterLink } from 'react-router-dom';
import { loginAdmin, saveAuthToken } from '../services/authService';
import type { AdminUser } from '../types/api';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<AdminUser | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginState('loading');
    setMessage('');

    try {
      const response = await loginAdmin(email, password);
      saveAuthToken(response.data.token);
      setUser(response.data.user);
      setLoginState('success');
      setMessage('Login successful. Admin token saved for this browser.');
    } catch {
      setLoginState('error');
      setMessage('Login failed. Please check the admin email and password.');
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 55%, #d8eef7 100%)',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Button component={RouterLink} to="/" variant="text" startIcon={<LocalFloristIcon />} sx={{ alignSelf: 'flex-start' }}>
            Back to island
          </Button>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid rgba(111, 102, 85, 0.16)',
              boxShadow: '0 18px 42px rgba(127, 183, 126, 0.22)',
              p: { xs: 3, md: 4 },
            }}
          >
            <Stack component="form" spacing={3} onSubmit={handleSubmit}>
              <Box>
                <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 } }}>
                  Admin Login
                </Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                  Sign in to prepare the community guidebook.
                </Typography>
              </Box>

              {message && (
                <Alert severity={loginState === 'success' ? 'success' : 'error'}>
                  {message}
                  {user ? ` Welcome, ${user.email}.` : ''}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                disabled={loginState === 'loading'}
              >
                {loginState === 'loading' ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
