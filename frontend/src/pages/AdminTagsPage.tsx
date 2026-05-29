import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from '../services/authService';
import { createTag, deleteTag, listTags, updateTag } from '../services/tagService';
import type { Tag, TagInput } from '../types/api';

const emptyForm: TagInput = {
  name: '',
  slug: '',
  description: '',
};

export default function AdminTagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<TagInput>(emptyForm);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const modalTitle = useMemo(
    () => (editingTag ? 'Edit Tag' : 'Create Tag'),
    [editingTag],
  );

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }

    void refreshTags();
  }, [navigate]);

  async function refreshTags() {
    setLoading(true);
    setError('');

    try {
      const response = await listTags();
      setTags(response.data);
    } catch {
      setError('Unable to load tags.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingTag(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(tag: Tag) {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTag(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingTag) {
        await updateTag(editingTag.id, form);
        setMessage('Tag updated.');
      } else {
        await createTag(form);
        setMessage('Tag created.');
      }

      closeModal();
      await refreshTags();
    } catch {
      setError('Unable to save tag. Name and slug are required, and slug must be unique.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tag: Tag) {
    const confirmed = window.confirm(`Delete ${tag.name}?`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deleteTag(tag.id);
      setMessage('Tag deleted.');
      await refreshTags();
    } catch {
      setError('Unable to delete tag.');
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
        background:
          'linear-gradient(180deg, #fff8e8 0%, #e5f4dc 58%, #d8eef7 100%)',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 } }}>
                Tags
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Label posts with helpful community topics.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/admin/categories" variant="outlined" startIcon={<CategoryIcon />}>
                Categories
              </Button>
              <Button component={RouterLink} to="/admin/posts" variant="outlined" startIcon={<ArticleIcon />}>
                Posts
              </Button>
              <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
                New
              </Button>
            </Stack>
          </Stack>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: '1px solid rgba(111, 102, 85, 0.16)',
              boxShadow: '0 18px 42px rgba(127, 183, 126, 0.18)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4}>Loading tags...</TableCell>
                  </TableRow>
                )}
                {!loading && tags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>No tags yet.</TableCell>
                  </TableRow>
                )}
                {tags.map((tag) => (
                  <TableRow key={tag.id} hover>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell>{tag.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Edit ${tag.name}`} onClick={() => openEditModal(tag)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label={`Delete ${tag.name}`} onClick={() => void handleDelete(tag)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Slug"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
