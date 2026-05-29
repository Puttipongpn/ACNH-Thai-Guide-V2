import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { searchPosts } from '../services/postService';
import { publicPalette } from '../theme/appTheme';
import type { Post } from '../types/api';
import { softBorder, softShadow } from '../utils/publicStyle';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeQuery = useMemo(() => searchParams.get('q')?.trim() ?? '', [searchParams]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              border: softBorder,
              boxShadow: softShadow,
              bgcolor: 'rgba(255, 253, 244, 0.76)',
              borderRadius: 7,
            }}
          >
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  color: publicPalette.leafDeep,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                ค้นหาสารบัญ
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 50 } }}>
                ค้นหาไกด์ของเกาะ
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, maxWidth: 720 }}>
                ค้นหาได้จากชื่อ คำอธิบาย หมวดหมู่ tag เดือน หรือประเภทเนื้อหา
              </Typography>
              <SearchBar key={activeQuery} initialValue={activeQuery} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['มือใหม่', 'NPC', 'DLC', 'พฤษภาคม'].map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    size="small"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                    sx={{ bgcolor: publicPalette.leafPale, cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {loading && <Alert severity="info">Searching the island notebook...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !activeQuery && <EmptyState message="พิมพ์คำค้นเพื่อหา published community guides" />}
          {!loading && activeQuery && posts.length === 0 && <EmptyState message="ยังไม่พบ published guides ที่ตรงกับคำค้นนี้ ลองใช้คำว่า มือใหม่, NPC, DLC หรือ พฤษภาคม" />}
          {posts.length > 0 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
                  {activeQuery ? `ผลการค้นหา "${activeQuery}"` : 'รายการทั้งหมด'}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{posts.length} รายการ</Typography>
              </Stack>
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
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
