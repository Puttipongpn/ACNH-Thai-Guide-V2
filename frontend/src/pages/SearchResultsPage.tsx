import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import { searchPosts } from '../services/postService';
import type { Post } from '../types/api';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeQuery = useMemo(() => searchParams.get('q')?.trim() ?? '', [searchParams]);
  const [query, setQuery] = useState(activeQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery(activeQuery);
    let active = true;

    async function loadResults() {
      if (!activeQuery) {
        setPosts([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await searchPosts({ q: activeQuery, page: 1, limit: 20 });
        if (!active) return;
        setPosts(response.data);
      } catch {
        if (!active) return;
        setError('Unable to search guides right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadResults();

    return () => {
      active = false;
    };
  }, [activeQuery]);

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
        background: 'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 58%, #d8eef7 100%)',
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
            Home
          </Button>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              border: '1px solid rgba(111, 102, 85, 0.14)',
              boxShadow: '0 18px 42px rgba(127, 183, 126, 0.18)',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>
                Search Guides
              </Typography>
              <Box component="form" onSubmit={handleSearch}>
                <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, description, tag, or category"
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
              {activeQuery && (
                <Typography sx={{ color: 'text.secondary' }}>
                  Results for "{activeQuery}"
                </Typography>
              )}
            </Stack>
          </Paper>

          {loading && <Alert severity="info">Searching the island notebook...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !activeQuery && <EmptyState message="Type a search term to find published community guides." />}
          {!loading && activeQuery && posts.length === 0 && <EmptyState message="No published guides matched this search." />}
          {posts.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              }}
            >
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
