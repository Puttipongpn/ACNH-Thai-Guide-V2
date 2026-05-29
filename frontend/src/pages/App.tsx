import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink } from 'react-router-dom';
import { getHealthStatus } from '../services/healthService';
import type { HealthStatus } from '../types/api';

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let active = true;

    getHealthStatus()
      .then((response) => {
        if (!active) return;
        setHealth(response.data);
        setLoadState(response.success ? 'ready' : 'error');
      })
      .catch(() => {
        if (!active) return;
        setLoadState('error');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 52%, #d8eef7 100%)',
        py: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Chip
                icon={<LocalFloristIcon />}
                label="Community island notebook"
                color="primary"
                variant="filled"
                sx={{ mb: 2 }}
              />
              <Typography variant="h1" sx={{ fontSize: { xs: 38, md: 58 }, maxWidth: 760 }}>
                Animal Crossing New Horizons Community Index
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: 20, md: 26 },
                  fontWeight: 500,
                  maxWidth: 680,
                  mt: 2,
                }}
              >
                A warm, searchable guidebook for Thai islanders, guides, tips, posts, and cozy discoveries.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: '1px solid rgba(111, 102, 85, 0.16)',
                boxShadow: '0 18px 42px rgba(127, 183, 126, 0.22)',
                p: 3,
                width: { xs: '100%', md: 320 },
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">API Status</Typography>
                {loadState === 'loading' && <Alert severity="info">Checking the island radio...</Alert>}
                {loadState === 'ready' && (
                  <Alert severity="success">
                    Backend online. Database {health?.database ?? 'unknown'}.
                  </Alert>
                )}
                {loadState === 'error' && (
                  <Alert severity="error">
                    Backend is not reachable yet. Start Docker Compose and try again.
                  </Alert>
                )}
                <Stack direction="row" spacing={1}>
                  <Chip label={`API: ${health?.api ?? loadState}`} size="small" />
                  <Chip label={`DB: ${health?.database ?? 'pending'}`} size="small" />
                </Stack>
              </Stack>
            </Paper>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid rgba(111, 102, 85, 0.14)',
              boxShadow: '0 16px 36px rgba(154, 197, 216, 0.24)',
              p: { xs: 3, md: 4 },
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
                Starter Home
              </Typography>
              <Typography sx={{ color: 'text.secondary', maxWidth: 760 }}>
                The foundation is ready with admin tools, post management, and a cozy content builder.
                Next up: public browsing, search, media files, and the first guide pages.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" startIcon={<SearchIcon />}>
                  Browse guides
                </Button>
                <Button component={RouterLink} to="/admin/posts" variant="outlined" startIcon={<FavoriteIcon />}>
                  Admin login
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
