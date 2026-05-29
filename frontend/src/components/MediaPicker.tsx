import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { deleteMedia, listMedia, uploadMedia } from '../services/mediaService';
import type { MediaFile } from '../types/api';

type MediaKind = 'image' | 'video';

type Props = {
  kind: MediaKind;
  selectedUrl?: string;
  onSelect: (media: MediaFile) => void;
};

export default function MediaPicker({ kind, selectedUrl, onSelect }: Props) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const filteredMedia = useMemo(
    () => media.filter((item) => item.mime_type.startsWith(`${kind}/`)),
    [kind, media],
  );

  useEffect(() => {
    void refreshMedia();
  }, []);

  async function refreshMedia() {
    setLoading(true);
    setError('');
    try {
      const response = await listMedia();
      setMedia(response.data);
    } catch {
      setError('Unable to load media files.');
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

    try {
      const response = await uploadMedia(file, setProgress);
      setMedia((current) => [response.data, ...current]);
      onSelect(response.data);
      setProgress(100);
    } catch {
      setError('Unable to upload this file. Images and reasonable video files are supported.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(mediaFile: MediaFile) {
    const confirmed = window.confirm(`Delete ${mediaFile.original_name}?`);
    if (!confirmed) return;

    setError('');
    try {
      await deleteMedia(mediaFile.id);
      setMedia((current) => current.filter((item) => item.id !== mediaFile.id));
    } catch {
      setError('Unable to delete media file.');
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid rgba(111, 102, 85, 0.14)',
        bgcolor: '#fff8e8',
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 800 }}>{kind === 'image' ? 'Image Library' : 'Video Library'}</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Upload or choose an existing file.
            </Typography>
          </Box>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={uploading}>
            Upload
            <input
              hidden
              type="file"
              accept={kind === 'image' ? 'image/*' : 'video/*'}
              onChange={(event) => void handleUpload(event)}
            />
          </Button>
        </Stack>

        {uploading && <LinearProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress} />}
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <Alert severity="info">Loading media...</Alert>}
        {!loading && filteredMedia.length === 0 && <Alert severity="info">No uploaded {kind} files yet.</Alert>}

        {filteredMedia.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              maxHeight: 360,
              overflow: 'auto',
              pr: 0.5,
            }}
          >
            {filteredMedia.map((item) => {
              const selected = item.file_url === selectedUrl;
              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    border: selected ? '2px solid #76a86f' : '1px solid rgba(111, 102, 85, 0.14)',
                    bgcolor: '#fffdf4',
                  }}
                >
                  <Stack spacing={1}>
                    {item.mime_type.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={item.file_url}
                        alt={item.original_name}
                        sx={{
                          width: '100%',
                          aspectRatio: '16 / 9',
                          objectFit: 'cover',
                          borderRadius: 1,
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
                          borderRadius: 1,
                          border: '1px solid rgba(111, 102, 85, 0.12)',
                        }}
                      />
                    )}
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Chip
                        icon={item.mime_type.startsWith('image/') ? <ImageIcon /> : <OndemandVideoIcon />}
                        label={item.original_name}
                        size="small"
                        sx={{ maxWidth: 'calc(100% - 42px)' }}
                      />
                      <Tooltip title="Delete media">
                        <IconButton size="small" onClick={() => void handleDelete(item)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Button variant={selected ? 'contained' : 'outlined'} onClick={() => onSelect(item)}>
                      {selected ? 'Selected' : 'Use this file'}
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
