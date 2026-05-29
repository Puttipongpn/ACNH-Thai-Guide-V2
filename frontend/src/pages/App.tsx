import { useEffect, useMemo, useState } from 'react';
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { listCategories } from '../services/categoryService';
import { getHealthStatus } from '../services/healthService';
import { listPosts } from '../services/postService';
import { publicPalette } from '../theme/appTheme';
import type { Category, HealthStatus, Post } from '../types/api';
import { cardShadow, publicShellBackground, softBorder, softShadow } from '../utils/publicStyle';

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const imageFriendlyPost = useMemo(() => posts.find((post) => post.description) ?? posts[0], [posts]);

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

  return (
    <Box
      sx={{
        background: publicShellBackground,
      }}
    >
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: 'rgba(146, 189, 145, 0.22)',
            top: 24,
            right: { xs: -170, md: '8%' },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            bgcolor: 'rgba(222, 239, 240, 0.65)',
            left: { xs: -160, md: '3%' },
            bottom: 8,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 8 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 6 }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography
                sx={{
                  mb: 1.5,
                  color: publicPalette.leafDeep,
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                Animal Crossing: New Horizons ภาษาไทย
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: 39, md: 58 }, maxWidth: 760 }}>
                สมุดคู่มือเกาะ
                <Box component="br" sx={{ display: { xs: 'none', sm: 'block' } }} /> ที่หาโพสต์เก่าเจอง่ายขึ้น
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'inherit',
                  fontSize: { xs: 17, md: 20 },
                  fontWeight: 500,
                  lineHeight: 1.9,
                  mt: 2,
                  maxWidth: 680,
                }}
              >
                รวมโพสต์ไกด์ กฎสำคัญ เทคนิค และบันทึกชุมชนไว้ในหน้าเดียว
                เพื่อให้เปิดอ่านบนมือถือได้แบบสบาย ๆ เหมือนพลิกสมุดโน้ตประจำเกาะ
              </Typography>
              <Box sx={{ mt: 4, maxWidth: 700 }}>
                <SearchBar />
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.25, color: 'text.secondary' }}>
                <Typography sx={{ fontSize: 13, mr: 0.5 }}>ลองค้นหา:</Typography>
                {['NSO', 'มือใหม่', 'Celeste', 'รายเดือน', 'กุหลาบน้ำเงิน'].map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    size="small"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  />
                ))}
              </Stack>
              <Box
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 1.5,
                  maxWidth: 640,
                }}
              >
                {[
                  [categories.length, 'หมวดหลัก'],
                  [posts.length, 'ไกด์ล่าสุด'],
                  [health?.database === 'ok' ? 'OK' : '...', 'ฐานข้อมูล'],
                ].map(([value, label]) => (
                  <Paper
                    key={label}
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.7)',
                      bgcolor: 'rgba(255,255,255,0.62)',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontSize: { xs: 20, sm: 26 } }}>
                      {value}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>{label}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${publicPalette.creamDeep}`,
                boxShadow: softShadow,
                p: 0,
                width: { xs: '100%', md: 350 },
                overflow: 'hidden',
                transform: { md: 'rotate(1deg)' },
                borderRadius: 7,
              }}
            >
              <Box
                sx={{
                  height: 170,
                  bgcolor: publicPalette.creamDeep,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 48,
                }}
              >
                🌿
              </Box>
              <Stack spacing={2} sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ color: 'text.secondary', fontSize: 14 }}>
                  <Typography sx={{ fontSize: 14 }}>บันทึกเกาะวันนี้</Typography>
                  <Typography sx={{ fontSize: 16 }}>🏝️</Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontSize: 22 }}>
                  เริ่มอ่านตรงไหนดี?
                </Typography>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: 14 }}>
                  ถ้าเพิ่งเข้ากลุ่ม ให้เริ่มจากกฎสำคัญ, NSO และ Beginner Guide ก่อน
                </Typography>
                {imageFriendlyPost && (
                  <Button component={RouterLink} to={`/posts/${imageFriendlyPost.id}`} variant="contained" fullWidth>
                    อ่านไกด์ล่าสุด
                  </Button>
                )}
                <Box>
                  {loadState === 'loading' && <Alert severity="info">กำลังเช็กวิทยุเกาะ...</Alert>}
                  {loadState === 'ready' && <Alert severity="success">API พร้อมใช้งาน ฐานข้อมูล {health?.database}</Alert>}
                  {loadState === 'error' && <Alert severity="error">Backend ยังไม่พร้อมใช้งาน</Alert>}
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={6}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2}>
            <Box>
              <Typography sx={{ color: publicPalette.leafDeep, fontSize: 12, fontWeight: 800, letterSpacing: '0.14em' }}>
                เลือกอ่านตามเรื่อง
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 }, mt: 1 }}>
                หมวดที่ค้นหาบ่อย
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                กดที่การ์ดเพื่อเปิดสารบัญย่อยของแต่ละหัวข้อ
              </Typography>
            </Box>
            {categories.length === 0 ? (
              <EmptyState message="ยังไม่มีหมวดบนแผนที่เกาะตอนนี้" />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                }}
              >
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </Box>
            )}
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 7,
              border: softBorder,
              bgcolor: 'rgba(226, 239, 222, 0.45)',
              boxShadow: cardShadow,
            }}
          >
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography sx={{ color: publicPalette.leafDeep, fontSize: 12, fontWeight: 800, letterSpacing: '0.14em' }}>
                    สำหรับผู้เล่นใหม่
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 }, mt: 1 }}>
                    อ่านก่อน แล้วค่อยบินอย่างมั่นใจ
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                    Latest published guides from the community notebook.
                  </Typography>
                </Box>
              </Stack>
              {posts.length === 0 ? (
                <EmptyState message="ยังไม่มี published guides ตอนนี้ Drafts ยังเก็บไว้อย่างปลอดภัยใน admin" />
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
          </Paper>

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 } }}>
                  ตามหาไกด์เพิ่มเติม
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  ใช้ช่องค้นหาเพื่อหาโพสต์จากชื่อ หมวด tag หรือคำอธิบาย
                </Typography>
              </Box>
            </Stack>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6, border: softBorder, bgcolor: publicPalette.paper }}>
              <SearchBar compact />
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
