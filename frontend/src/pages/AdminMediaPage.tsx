import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import { clearAuthToken, getAuthToken } from '../services/authService';
import { deleteMedia, listMedia, uploadMedia } from '../services/mediaService';
import type { MediaFile } from '../types/api';

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(
    () => ({
      images: media.filter((item) => item.mime_type.startsWith('image/')).length,
      videos: media.filter((item) => item.mime_type.startsWith('video/')).length,
    }),
    [media],
  );

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }

    void refreshMedia();
  }, [navigate]);

  async function refreshMedia() {
    setLoading(true);
    setError('');

    try {
      const response = await listMedia();
      setMedia(response.data);
    } catch {
      setError('Unable to load media. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');
    setMessage('');

    try {
      const response = await uploadMedia(file, setProgress);
      setMedia((current) => [response.data, ...current]);
      setMessage('Media uploaded. You can now use this URL in an image or video content block.');
    } catch {
      setError('Unable to upload file. Supported types: JPEG, PNG, WebP, GIF, MP4, and WebM.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(mediaFile: MediaFile) {
    const confirmed = window.confirm(`Delete ${mediaFile.original_name}?`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deleteMedia(mediaFile.id);
      setMedia((current) => current.filter((item) => item.id !== mediaFile.id));
      setMessage('Media deleted.');
    } catch {
      setError('Unable to delete media. Check whether the file is still needed before trying again.');
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Media URL copied.');
    } catch {
      setError('Unable to copy URL automatically. Select and copy it manually.');
    }
  }

  function handleLogout() {
    clearAuthToken();
    navigate('/login');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 58%, #d8eef7 100%)',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 38 } }}>
                Media Library
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Upload local images and videos, then select them inside post content blocks.
              </Typography>
            </Box>
            <AdminNav onLogout={handleLogout} />
          </Stack>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: '1px solid rgba(111, 102, 85, 0.16)',
              bgcolor: '#fffdf4',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} disabled={uploading}>
                Upload media
                <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={(event) => void handleUpload(event)} />
              </Button>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${media.length} files`} />
                <Chip icon={<ImageIcon />} label={`${counts.images} images`} />
                <Chip icon={<OndemandVideoIcon />} label={`${counts.videos} videos`} />
              </Stack>
            </Stack>
            {uploading && <LinearProgress sx={{ mt: 2 }} variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress} />}
          </Paper>

          {loading && <Alert severity="info">Loading media...</Alert>}
          {!loading && media.length === 0 && <Alert severity="info">No uploaded media yet.</Alert>}

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            {media.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(111, 102, 85, 0.14)',
                  bgcolor: '#fffdf4',
                  overflow: 'hidden',
                }}
              >
                <Stack spacing={1.25}>
                  {item.mime_type.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={item.file_url}
                      alt={item.original_name}
                      sx={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        border: '1px solid rgba(111, 102, 85, 0.12)',
                      }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={item.file_url}
                      controls
                      sx={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        borderRadius: 1.5,
                        border: '1px solid rgba(111, 102, 85, 0.12)',
                      }}
                    />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{item.original_name}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, overflowWrap: 'anywhere' }}>
                      {item.mime_type} · {formatBytes(item.size)}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                    <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => void copyUrl(item.file_url)}>
                      Copy URL
                    </Button>
                    <Tooltip title="Delete media">
                      <IconButton size="small" onClick={() => void handleDelete(item)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
