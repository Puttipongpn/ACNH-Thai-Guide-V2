import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NotesIcon from '@mui/icons-material/Notes';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import {
  createContentBlock,
  deleteContentBlock,
  listContentBlocks,
  reorderContentBlocks,
  updateContentBlock,
} from '../services/contentBlockService';
import type {
  ContentBlock,
  ContentBlockInput,
  ContentBlockType,
  ContentImageLayout,
  ContentTextSize,
} from '../types/api';
import ContentBlockRenderer from './ContentBlockRenderer';

type Props = {
  postId: string;
};

const blockLabels: Record<ContentBlockType, string> = {
  TEXT_BLOCK: 'Text',
  IMAGE_BLOCK: 'Image',
  VIDEO_BLOCK: 'Video',
  HIGHLIGHT_BLOCK: 'Highlight',
};

const emptyInput: ContentBlockInput = {
  type: 'TEXT_BLOCK',
  sort_order: 0,
  content: '',
  metadata: { size: 'medium' },
};

function inputForType(type: ContentBlockType, sortOrder: number): ContentBlockInput {
  if (type === 'IMAGE_BLOCK') {
    return {
      type,
      sort_order: sortOrder,
      content: '',
      metadata: { image_url: '', alt_text: '', layout: 'full_width', caption: '', text: '' },
    };
  }
  if (type === 'VIDEO_BLOCK') {
    return {
      type,
      sort_order: sortOrder,
      content: '',
      metadata: { title: '', url: '' },
    };
  }
  if (type === 'HIGHLIGHT_BLOCK') {
    return {
      type,
      sort_order: sortOrder,
      content: '',
      metadata: { title: '' },
    };
  }

  return {
    type,
    sort_order: sortOrder,
    content: '',
    metadata: { size: 'medium' },
  };
}

export default function ContentBlockBuilder({ postId }: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [form, setForm] = useState<ContentBlockInput>(emptyInput);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const modalTitle = useMemo(
    () => (editingBlock ? `Edit ${blockLabels[editingBlock.type]} Block` : 'Add Content Block'),
    [editingBlock],
  );

  useEffect(() => {
    void refreshBlocks();
  }, [postId]);

  async function refreshBlocks() {
    setLoading(true);
    setError('');
    try {
      const response = await listContentBlocks(postId);
      setBlocks(response.data);
    } catch {
      setError('Unable to load content blocks.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal(type: ContentBlockType) {
    setEditingBlock(null);
    setForm(inputForType(type, blocks.length));
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(block: ContentBlock) {
    setEditingBlock(block);
    setForm({
      type: block.type,
      sort_order: block.sort_order,
      content: block.content,
      metadata: { ...block.metadata },
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBlock(null);
    setForm(emptyInput);
  }

  function updateMetadata(key: string, value: string) {
    setForm((current) => ({
      ...current,
      metadata: {
        ...current.metadata,
        [key]: value,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingBlock) {
        await updateContentBlock(editingBlock.id, form);
        setMessage('Content block updated.');
      } else {
        await createContentBlock(postId, form);
        setMessage('Content block added.');
      }
      closeModal();
      await refreshBlocks();
    } catch {
      setError('Unable to save content block. Please check required fields.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(block: ContentBlock) {
    const confirmed = window.confirm(`Delete ${blockLabels[block.type]} block?`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deleteContentBlock(block.id);
      setMessage('Content block deleted.');
      await refreshBlocks();
    } catch {
      setError('Unable to delete content block.');
    }
  }

  async function moveBlock(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;

    const reordered = [...blocks];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setBlocks(reordered.map((block, blockIndex) => ({ ...block, sort_order: blockIndex })));
    setError('');
    setMessage('');

    try {
      const response = await reorderContentBlocks(postId, reordered.map((block) => block.id));
      setBlocks(response.data);
      setMessage('Content blocks reordered.');
    } catch {
      setError('Unable to reorder content blocks.');
      await refreshBlocks();
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(111, 102, 85, 0.14)',
        bgcolor: '#fffdf4',
        boxShadow: '0 16px 34px rgba(154, 197, 216, 0.18)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Content Builder
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Arrange the guide body with cozy reusable blocks.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Tooltip title="Add text block">
              <Button variant="outlined" startIcon={<NotesIcon />} onClick={() => openCreateModal('TEXT_BLOCK')}>
                Text
              </Button>
            </Tooltip>
            <Tooltip title="Add image block">
              <Button variant="outlined" startIcon={<AddPhotoAlternateIcon />} onClick={() => openCreateModal('IMAGE_BLOCK')}>
                Image
              </Button>
            </Tooltip>
            <Tooltip title="Add video block">
              <Button variant="outlined" startIcon={<OndemandVideoIcon />} onClick={() => openCreateModal('VIDEO_BLOCK')}>
                Video
              </Button>
            </Tooltip>
            <Tooltip title="Add highlight block">
              <Button variant="outlined" startIcon={<FormatQuoteIcon />} onClick={() => openCreateModal('HIGHLIGHT_BLOCK')}>
                Highlight
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {loading && <Alert severity="info">Loading content blocks...</Alert>}
        {!loading && blocks.length === 0 && <Alert severity="info">No content blocks yet.</Alert>}

        <Stack spacing={2}>
          {blocks.map((block, index) => (
            <Paper
              key={block.id}
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid rgba(111, 102, 85, 0.14)',
                bgcolor: '#fff8e8',
                overflow: 'hidden',
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {index + 1}. {blockLabels[block.type]}
                  </Typography>
                  <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
                    <Tooltip title="Move up">
                      <span>
                        <IconButton size="small" disabled={index === 0} onClick={() => void moveBlock(index, -1)}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === blocks.length - 1}
                          onClick={() => void moveBlock(index, 1)}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit block">
                      <IconButton size="small" onClick={() => openEditModal(block)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete block">
                      <IconButton size="small" onClick={() => void handleDelete(block)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                <ContentBlockRenderer block={block} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogContent sx={{ px: { xs: 2, md: 3 } }}>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {!editingBlock && (
                <ToggleButtonGroup
                  exclusive
                  value={form.type}
                  onChange={(_, value: ContentBlockType | null) => {
                    if (value) setForm(inputForType(value, blocks.length));
                  }}
                  sx={{
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                      flex: { xs: '1 1 45%', sm: '0 0 auto' },
                    },
                  }}
                >
                  <ToggleButton value="TEXT_BLOCK">Text</ToggleButton>
                  <ToggleButton value="IMAGE_BLOCK">Image</ToggleButton>
                  <ToggleButton value="VIDEO_BLOCK">Video</ToggleButton>
                  <ToggleButton value="HIGHLIGHT_BLOCK">Highlight</ToggleButton>
                </ToggleButtonGroup>
              )}

              {(form.type === 'TEXT_BLOCK' || form.type === 'HIGHLIGHT_BLOCK') && (
                <TextField
                  label="Content"
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  multiline
                  minRows={form.type === 'TEXT_BLOCK' ? 5 : 3}
                  required
                  fullWidth
                />
              )}

              {form.type === 'TEXT_BLOCK' && (
                <FormControl fullWidth required>
                  <InputLabel id="text-size-label">Text size</InputLabel>
                  <Select
                    labelId="text-size-label"
                    label="Text size"
                    value={form.metadata.size ?? 'medium'}
                    onChange={(event) => updateMetadata('size', event.target.value as ContentTextSize)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              )}

              {form.type === 'IMAGE_BLOCK' && (
                <>
                  <TextField
                    label="Image URL"
                    value={form.metadata.image_url ?? ''}
                    onChange={(event) => updateMetadata('image_url', event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Alt text"
                    value={form.metadata.alt_text ?? ''}
                    onChange={(event) => updateMetadata('alt_text', event.target.value)}
                    fullWidth
                  />
                  <FormControl fullWidth required>
                    <InputLabel id="image-layout-label">Layout</InputLabel>
                    <Select
                      labelId="image-layout-label"
                      label="Layout"
                      value={form.metadata.layout ?? 'full_width'}
                      onChange={(event) => updateMetadata('layout', event.target.value as ContentImageLayout)}
                    >
                      <MenuItem value="full_width">Full width</MenuItem>
                      <MenuItem value="left_image">Left image</MenuItem>
                      <MenuItem value="right_image">Right image</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Caption"
                    value={form.metadata.caption ?? ''}
                    onChange={(event) => updateMetadata('caption', event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Side text"
                    value={form.metadata.text ?? ''}
                    onChange={(event) => updateMetadata('text', event.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </>
              )}

              {form.type === 'VIDEO_BLOCK' && (
                <>
                  <TextField
                    label="Video title"
                    value={form.metadata.title ?? ''}
                    onChange={(event) => updateMetadata('title', event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Video URL"
                    value={form.metadata.url ?? ''}
                    onChange={(event) => updateMetadata('url', event.target.value)}
                    required
                    fullWidth
                  />
                </>
              )}

              {form.type === 'HIGHLIGHT_BLOCK' && (
                <TextField
                  label="Highlight title"
                  value={form.metadata.title ?? ''}
                  onChange={(event) => updateMetadata('title', event.target.value)}
                  fullWidth
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}
