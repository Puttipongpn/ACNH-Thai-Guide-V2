import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
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
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import SellIcon from '@mui/icons-material/Sell';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ContentBlockBuilder from '../components/ContentBlockBuilder';
import { clearAuthToken, getAuthToken } from '../services/authService';
import { listCategories } from '../services/categoryService';
import { createPost, deletePost, listPosts, updatePost } from '../services/postService';
import { listTags } from '../services/tagService';
import type { Category, Post, PostInput, PostStatus, Tag } from '../types/api';

const emptyForm: PostInput = {
  title: '',
  slug: '',
  description: '',
  source_url: '',
  status: 'draft',
  category_id: '',
  tag_ids: [],
};

export default function AdminPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<PostInput>(emptyForm);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const modalTitle = useMemo(
    () => (editingPost ? 'Edit Post' : 'Create Post'),
    [editingPost],
  );

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }

    void refreshData();
  }, [navigate]);

  async function refreshData() {
    setLoading(true);
    setError('');

    try {
      const [postResponse, categoryResponse, tagResponse] = await Promise.all([
        listPosts(),
        listCategories(),
        listTags(),
      ]);
      setPosts(postResponse.data);
      setCategories(categoryResponse.data);
      setTags(tagResponse.data);
    } catch {
      setError('Unable to load posts. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPost(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id ?? '',
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(post: Post) {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      source_url: post.source_url,
      status: post.status,
      category_id: post.category_id,
      tag_ids: post.tags.map((tag) => tag.id),
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPost(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingPost) {
        await updatePost(editingPost.id, form);
        setMessage('Post updated.');
      } else {
        await createPost(form);
        setMessage('Post created.');
      }

      closeModal();
      await refreshData();
    } catch {
      setError('Unable to save post. Title, slug, category, and valid status are required. Slug must be unique.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: Post) {
    const confirmed = window.confirm(`Delete ${post.title}?`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deletePost(post.id);
      setMessage('Post deleted.');
      await refreshData();
    } catch {
      setError('Unable to delete post.');
    }
  }

  function handleLogout() {
    clearAuthToken();
    navigate('/login');
  }

  function tagNames(tagIDs: string[]) {
    return tags
      .filter((tag) => tagIDs.includes(tag.id))
      .map((tag) => tag.name)
      .join(', ');
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
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 } }}>
                Posts
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Draft and publish community guides with sources and labels.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/admin/categories" variant="outlined" startIcon={<CategoryIcon />}>
                Categories
              </Button>
              <Button component={RouterLink} to="/admin/tags" variant="outlined" startIcon={<SellIcon />}>
                Tags
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
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6}>Loading posts...</TableCell>
                  </TableRow>
                )}
                {!loading && posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>No posts yet.</TableCell>
                  </TableRow>
                )}
                {posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{post.title}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{post.slug}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={post.status} size="small" color={post.status === 'published' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell>{post.category?.name ?? '-'}</TableCell>
                    <TableCell>{post.tags.length > 0 ? post.tags.map((tag) => tag.name).join(', ') : '-'}</TableCell>
                    <TableCell>{post.source_url || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Edit ${post.title}`} onClick={() => openEditModal(post)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label={`Delete ${post.title}`} onClick={() => void handleDelete(post)}>
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

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="lg">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
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
                label="Facebook source URL"
                value={form.source_url}
                onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel id="post-category-label">Category</InputLabel>
                  <Select
                    labelId="post-category-label"
                    label="Category"
                    value={form.category_id}
                    onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel id="post-status-label">Status</InputLabel>
                  <Select
                    labelId="post-status-label"
                    label="Status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as PostStatus,
                      }))
                    }
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <FormControl fullWidth>
                <InputLabel id="post-tags-label">Tags</InputLabel>
                <Select
                  labelId="post-tags-label"
                  multiple
                  value={form.tag_ids}
                  input={<OutlinedInput label="Tags" />}
                  renderValue={(selected) => tagNames(selected)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((current) => ({
                      ...current,
                      tag_ids: typeof value === 'string' ? value.split(',') : value,
                    }));
                  }}
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      <Checkbox checked={form.tag_ids.includes(tag.id)} />
                      <ListItemText primary={tag.name} secondary={tag.slug} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {editingPost && <ContentBlockBuilder postId={editingPost.id} />}
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
