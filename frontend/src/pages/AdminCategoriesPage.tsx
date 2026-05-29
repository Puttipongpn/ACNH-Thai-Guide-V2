import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import { clearAuthToken, getAuthToken } from '../services/authService';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../services/categoryService';
import type { Category, CategoryInput } from '../types/api';

const emptyForm: CategoryInput = {
  name: '',
  slug: '',
  description: '',
  display_order: 0,
};

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const modalTitle = useMemo(
    () => (editingCategory ? 'Edit Category' : 'Create Category'),
    [editingCategory],
  );

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }

    void refreshCategories();
  }, [navigate]);

  async function refreshCategories() {
    setLoading(true);
    setError('');

    try {
      const response = await listCategories();
      setCategories(response.data);
    } catch {
      setError('Unable to load categories. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      display_order: category.display_order,
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
        setMessage('Category updated.');
      } else {
        await createCategory(form);
        setMessage('Category created.');
      }

      closeModal();
      await refreshCategories();
    } catch {
      setError('Unable to save category. Name is required and slug must be unique.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Delete ${category.name}?`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deleteCategory(category.id);
      setMessage('Category deleted.');
      await refreshCategories();
    } catch {
      setError('Unable to delete category.');
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
                Categories
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Organize guides into friendly island notebook sections.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <AdminNav onLogout={handleLogout} />
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
                Create Category
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
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5}>Loading categories...</TableCell>
                  </TableRow>
                )}
                {!loading && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No categories yet.</TableCell>
                  </TableRow>
                )}
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell align="right">{category.display_order}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Edit ${category.name}`} onClick={() => openEditModal(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label={`Delete ${category.name}`} onClick={() => void handleDelete(category)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {loading && <Alert severity="info">Loading categories...</Alert>}
            {!loading && categories.length === 0 && <Alert severity="info">No categories yet.</Alert>}
            {categories.map((category) => (
              <Paper
                key={category.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid rgba(111, 102, 85, 0.14)',
                  bgcolor: '#fffdf4',
                  boxShadow: '0 12px 28px rgba(127, 183, 126, 0.14)',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13, overflowWrap: 'anywhere' }}>
                        {category.slug}
                      </Typography>
                    </Box>
                    <Chip label={`#${category.display_order}`} size="small" variant="outlined" />
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {category.description || 'No description yet.'}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton aria-label={`Edit ${category.name}`} onClick={() => openEditModal(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label={`Delete ${category.name}`} onClick={() => void handleDelete(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm" fullScreen={false}>
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
              <TextField
                label="Display order"
                type="number"
                value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    display_order: Number(event.target.value),
                  }))
                }
                fullWidth
              />
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
    </Box>
  );
}
