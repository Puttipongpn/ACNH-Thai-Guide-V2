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
import type { ContentBlock, Post } from '../types/api';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 58%, #d8eef7 100%)',
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
            Home
          </Button>

          {loading && <Alert severity="info">Loading guide...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {post && (
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
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={post.category?.name ?? 'Guide'} color="primary" />
                    <Chip label={post.status} variant="outlined" />
                    {post.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.name} variant="outlined" />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Created {new Date(post.created_at).toLocaleDateString()} · Updated{' '}
                    {new Date(post.updated_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>
                    {post.title}
                  </Typography>
                  {post.description && (
                    <Typography sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.8 }}>
                      {post.description}
                    </Typography>
                  )}
                  {post.source_url && (
                    <Link href={post.source_url} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', gap: 0.75, alignItems: 'center' }}>
                      Source <OpenInNewIcon fontSize="small" />
                    </Link>
                  )}
                </Stack>
              </Paper>

              <Stack spacing={3}>
                {blocks.length === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: '1px solid rgba(111, 102, 85, 0.14)',
                      bgcolor: '#fffdf4',
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
                      p: { xs: 2.5, md: 3 },
                      border: '1px solid rgba(111, 102, 85, 0.12)',
                      bgcolor: '#fffdf4',
                      boxShadow: '0 12px 30px rgba(154, 197, 216, 0.16)',
                    }}
                  >
                    <ContentBlockRenderer block={block} />
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
