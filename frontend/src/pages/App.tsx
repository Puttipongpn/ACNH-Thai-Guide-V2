import { FormEvent, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import { listCategories } from '../services/categoryService';
import { getHealthStatus } from '../services/healthService';
import { listPosts } from '../services/postService';
import type { Category, HealthStatus, Post } from '../types/api';

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        const [healthResponse, categoryResponse, postResponse] = await Promise.all([
          getHealthStatus(),
          listCategories(),
          listPosts({ page: 1, limit: 6 }),
        ]);
        if (!active) return;
        setHealth(healthResponse.data);
        setLoadState(healthResponse.success ? 'ready' : 'error');
        setCategories(categoryResponse.data);
        setPosts(postResponse.data);
      } catch {
        if (!active) return;
        setLoadState('error');
        setError('Unable to load the island notice board right now.');
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    navigate(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 52%, #d8eef7 100%)',
        py: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 760 }}>
              <Chip icon={<LocalFloristIcon />} label="Cozy island handbook" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h1" sx={{ fontSize: { xs: 38, md: 58 } }}>
                Animal Crossing New Horizons Community Index
              </Typography>
              <Typography
                variant="h2"
                sx={{ color: 'text.secondary', fontSize: { xs: 20, md: 26 }, fontWeight: 500, mt: 2 }}
              >
                Search Thai community guides, friendly tips, island notes, and useful references in one warm place.
              </Typography>
              <Box component="form" onSubmit={handleSearch} sx={{ mt: 3 }}>
                <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search guides, tags, categories..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button type="submit" variant="contained">
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
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
                  <Alert severity="success">Backend online. Database {health?.database ?? 'unknown'}.</Alert>
                )}
                {loadState === 'error' && (
                  <Alert severity="error">Backend is not reachable yet. Start Docker Compose and try again.</Alert>
                )}
                <Stack direction="row" spacing={1}>
                  <Chip label={`API: ${health?.api ?? loadState}`} size="small" />
                  <Chip label={`DB: ${health?.database ?? 'pending'}`} size="small" />
                </Stack>
                <Button component={RouterLink} to="/admin/posts" variant="outlined" startIcon={<FavoriteIcon />}>
                  Admin
                </Button>
              </Stack>
            </Paper>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2}>
            <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
              Categories
            </Typography>
            {categories.length === 0 ? (
              <EmptyState message="No categories are on the island map yet." />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
              >
                {categories.map((category) => (
                  <Box key={category.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        border: '1px solid rgba(111, 102, 85, 0.14)',
                        bgcolor: '#fffdf4',
                        boxShadow: '0 14px 32px rgba(154, 197, 216, 0.18)',
                      }}
                    >
                      <CardActionArea component={RouterLink} to={`/categories/${category.id}`} sx={{ height: '100%' }}>
                        <CardContent>
                          <Stack spacing={1.5}>
                            <CategoryIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {category.name}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                              {category.description || 'Community notes gathered for this island topic.'}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
                  Featured Guides
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Latest published guides from the community notebook.</Typography>
              </Box>
            </Stack>
            {posts.length === 0 ? (
              <EmptyState message="No published guides yet. Drafts are still tucked safely in admin." />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                }}
              >
                {posts.map((post) => (
                  <Box key={post.id}>
                    <PostCard post={post} />
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
