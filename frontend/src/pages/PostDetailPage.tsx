import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink, useParams } from 'react-router-dom';
import ContentBlockRenderer from '../components/ContentBlockRenderer';
import { listContentBlocks } from '../services/contentBlockService';
import { getPost } from '../services/postService';
import { publicPalette } from '../theme/appTheme';
import type { ContentBlock, Post } from '../types/api';
import { getCategoryIcon, softBorder, softShadow } from '../utils/publicStyle';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const firstImageBlock = blocks.find((block) => block.type === 'IMAGE_BLOCK' && block.metadata.image_url);

  useEffect(() => {
    let active = true;

    async function loadPost() {
      if (!id) {
        setError('Post not found.');
        setLoading(false);
        return;
      }

      try {
        const [postResponse, blockResponse] = await Promise.all([getPost(id), listContentBlocks(id)]);
        if (!active) return;
        setPost(postResponse.data);
        setBlocks(blockResponse.data);
      } catch {
        if (!active) return;
        setError('Unable to load this guide.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPost();

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
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
            หน้าแรก
          </Button>

          {loading && <Alert severity="info">Loading guide...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {post && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  border: softBorder,
                  boxShadow: softShadow,
                  bgcolor: 'rgba(255, 253, 244, 0.82)',
                  borderRadius: 7,
                  overflow: 'hidden',
                }}
              >
                {firstImageBlock?.metadata.image_url && (
                  <Box
                    component="figure"
                    sx={{
                      m: { xs: -1, md: -1.5 },
                      mb: { xs: 3, md: 4 },
                      overflow: 'hidden',
                      borderRadius: 5,
                      bgcolor: publicPalette.creamDeep,
                    }}
                  >
                    <Box
                      component="img"
                      src={firstImageBlock.metadata.image_url}
                      alt={firstImageBlock.metadata.alt_text ?? post.title}
                      sx={{
                        display: 'block',
                        width: '100%',
                        maxHeight: 470,
                        objectFit: 'cover',
                      }}
                    />
                    {firstImageBlock.metadata.caption && (
                      <Typography component="figcaption" sx={{ px: 2, py: 1.5, color: 'text.secondary', fontSize: 13 }}>
                        {firstImageBlock.metadata.caption}
                      </Typography>
                    )}
                  </Box>
                )}
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${getCategoryIcon(post.category)} ${post.category?.name ?? 'Guide'}`} color="primary" />
                    {post.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.name} sx={{ bgcolor: publicPalette.leafPale }} />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                    สร้าง {new Date(post.created_at).toLocaleDateString('th-TH')} · อัปเดต{' '}
                    {new Date(post.updated_at).toLocaleDateString('th-TH')}
                  </Typography>
                  <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>
                    {post.title}
                  </Typography>
                  {post.description && (
                    <Typography sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.8 }}>
                      {post.description}
                    </Typography>
                  )}
                </Stack>
              </Paper>

              <Stack spacing={3}>
                {blocks.length === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: softBorder,
                      bgcolor: publicPalette.paper,
                      borderRadius: 5,
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary' }}>This guide does not have content blocks yet.</Typography>
                  </Paper>
                )}
                {blocks.map((block) => (
                  <Paper
                    key={block.id}
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3.5 },
                      border: softBorder,
                      bgcolor: 'rgba(255, 253, 244, 0.82)',
                      boxShadow: '0 10px 24px rgba(83, 111, 87, 0.08)',
                      borderRadius: 5,
                    }}
                  >
                    <ContentBlockRenderer block={block} />
                  </Paper>
                ))}
              </Stack>

              {post.source_url && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    border: '1px dashed rgba(146, 189, 145, 0.36)',
                    bgcolor: 'rgba(255, 253, 244, 0.62)',
                    borderRadius: 5,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="h6" sx={{ fontSize: 20 }}>
                      ลิงก์ต้นทาง
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      เปิดโพสต์ Facebook เพื่ออ่านต้นฉบับ คอมเมนต์ และรายละเอียดเพิ่มเติมจากเจ้าของโพสต์
                    </Typography>
                    <Link
                      href={post.source_url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ display: 'inline-flex', gap: 0.75, alignItems: 'center', fontWeight: 800 }}
                    >
                      เปิดโพสต์ Facebook <OpenInNewIcon fontSize="small" />
                    </Link>
                  </Stack>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
