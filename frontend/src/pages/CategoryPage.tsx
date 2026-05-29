import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { getCategory } from '../services/categoryService';
import { listPostsByCategory } from '../services/postService';
import { listTags } from '../services/tagService';
import { publicPalette } from '../theme/appTheme';
import type { Category, Post, Tag } from '../types/api';
import { getCategoryIcon, getCategoryTone, softBorder, softShadow } from '../utils/publicStyle';

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
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
            หน้าแรก
          </Button>

          {loading && <Alert severity="info">Loading category...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {category && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  border: '1px solid rgba(255,255,255,0.75)',
                  boxShadow: softShadow,
                  bgcolor: getCategoryTone(category),
                  borderRadius: 7,
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between">
                  <Box sx={{ maxWidth: 760 }}>
                    <Typography sx={{ fontSize: 42 }} aria-hidden="true">
                      {getCategoryIcon(category)}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 2,
                        color: publicPalette.leafDeep,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Category {category.display_order}
                    </Typography>
                    <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 50 }, mt: 1 }}>
                      {category.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 17, lineHeight: 1.85, mt: 2 }}>
                      {category.description || 'รวมบันทึกชุมชนสำหรับหัวข้อนี้'}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                      {tags.slice(0, 8).map((tag) => (
                        <Chip key={tag.id} label={tag.name} sx={{ bgcolor: 'rgba(255,255,255,0.62)' }} />
                      ))}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignSelf={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Chip label={`${posts.length} หัวข้อ`} sx={{ bgcolor: 'rgba(255,255,255,0.68)' }} />
                    <Chip label="published" color="primary" />
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6, border: softBorder, bgcolor: publicPalette.paper }}>
                <SearchBar compact />
              </Paper>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 } }}>
                    รายการในหมวดนี้
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                    แสดงเฉพาะ published guides ที่เปิดอ่านได้บนเว็บ
                  </Typography>
                </Box>
                {posts.length === 0 ? (
                  <EmptyState message="ยังไม่มี published guides ในหมวดนี้" />
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
