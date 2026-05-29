import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import { getCategory } from '../services/categoryService';
import { listPostsByCategory } from '../services/postService';
import { listTags } from '../services/tagService';
import type { Category, Post, Tag } from '../types/api';

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCategory() {
      if (!id) {
        setError('Category not found.');
        setLoading(false);
        return;
      }

      try {
        const [categoryResponse, postsResponse, tagsResponse] = await Promise.all([
          getCategory(id),
          listPostsByCategory(id, { page: 1, limit: 12 }),
          listTags(),
        ]);
        if (!active) return;
        setCategory(categoryResponse.data);
        setPosts(postsResponse.data);
        setTags(tagsResponse.data);
      } catch {
        if (!active) return;
        setError('Unable to load this category.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCategory();

    return () => {
      active = false;
    };
  }, [id]);

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

          {loading && <Alert severity="info">Loading category...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {category && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: '1px solid rgba(111, 102, 85, 0.14)',
                  boxShadow: '0 18px 42px rgba(127, 183, 126, 0.18)',
                }}
              >
                <Stack spacing={2}>
                  <Chip label="Category" color="primary" sx={{ alignSelf: 'flex-start' }} />
                  <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>
                    {category.name}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.8 }}>
                    {category.description || 'A shelf of community guides for this island topic.'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tags.slice(0, 12).map((tag) => (
                      <Chip key={tag.id} label={tag.name} variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Stack spacing={2}>
                <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
                  Published Guides
                </Typography>
                {posts.length === 0 ? (
                  <EmptyState message="No published guides in this category yet." />
                ) : (
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
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
