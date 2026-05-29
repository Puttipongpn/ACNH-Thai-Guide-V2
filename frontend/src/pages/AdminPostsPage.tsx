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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import ContentBlockBuilder from '../components/ContentBlockBuilder';
import { listContentBlocks } from '../services/contentBlockService';
import { clearAuthToken, getAuthToken } from '../services/authService';
import { listCategories } from '../services/categoryService';
import { createPost, deletePost, listAdminPosts, updatePost } from '../services/postService';
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
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
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
        listAdminPosts(),
        listCategories(),
        listTags(),
      ]);
      setPosts(postResponse.data);
      setCategories(categoryResponse.data);
      setTags(tagResponse.data);
      const counts = await Promise.all(
        postResponse.data.map(async (post) => {
          try {
            const response = await listContentBlocks(post.id);
            return [post.id, response.data.length] as const;
          } catch {
            return [post.id, 0] as const;
          }
        }),
      );
      setContentCounts(Object.fromEntries(counts));
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
        const response = await createPost(form);
        const createdPost = response.data;
        setEditingPost(createdPost);
        setForm({
          title: createdPost.title,
          slug: createdPost.slug,
          description: createdPost.description,
          source_url: createdPost.source_url,
          status: createdPost.status,
          category_id: createdPost.category_id,
          tag_ids: createdPost.tags.map((tag) => tag.id),
        });
        setMessage('Post created. Continue with Step 2: add content blocks.');
        await refreshData();
        return;
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

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <AdminNav onLogout={handleLogout} />
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
                Create Post
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
              display: { xs: 'none', lg: 'block' },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7}>Loading posts...</TableCell>
                  </TableRow>
                )}
                {!loading && posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>No posts yet.</TableCell>
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
                    <TableCell>
                      <Chip
                        icon={<AutoStoriesIcon />}
                        label={`${contentCounts[post.id] ?? 0} blocks`}
                        size="small"
                        color={(contentCounts[post.id] ?? 0) > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{post.tags.length > 0 ? post.tags.map((tag) => tag.name).join(', ') : '-'}</TableCell>
                    <TableCell>{post.source_url || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Edit ${post.title}`} onClick={() => openEditModal(post)}>
                        <EditIcon />
                      </IconButton>
                      <Button size="small" variant="outlined" onClick={() => openEditModal(post)}>
                        Edit Content
                      </Button>
                      <IconButton aria-label={`Delete ${post.title}`} onClick={() => void handleDelete(post)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={1.5} sx={{ display: { xs: 'flex', lg: 'none' } }}>
            {loading && <Alert severity="info">Loading posts...</Alert>}
            {!loading && posts.length === 0 && <Alert severity="info">No posts yet.</Alert>}
            {posts.map((post) => (
              <Paper
                key={post.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid rgba(111, 102, 85, 0.14)',
                  bgcolor: '#fffdf4',
                  boxShadow: '0 12px 28px rgba(127, 183, 126, 0.14)',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>{post.title}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13, overflowWrap: 'anywhere' }}>
                        {post.slug}
                      </Typography>
                    </Box>
                    <Chip label={post.status} size="small" color={post.status === 'published' ? 'primary' : 'default'} />
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={post.category?.name ?? 'No category'} size="small" variant="outlined" />
                    <Chip
                      label={`${contentCounts[post.id] ?? 0} content blocks`}
                      size="small"
                      color={(contentCounts[post.id] ?? 0) > 0 ? 'primary' : 'default'}
                    />
                    {post.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, overflowWrap: 'anywhere' }}>
                    {post.source_url || 'No source URL'}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEditModal(post)}>
                      Edit / Content
                    </Button>
                    <IconButton aria-label={`Delete ${post.title}`} onClick={() => void handleDelete(post)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="lg">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogContent sx={{ px: { xs: 2, md: 3 } }}>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(111, 102, 85, 0.14)', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>Step 1: Post info</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                      Add the searchable title, slug, category, status, tags, and Facebook source.
                    </Typography>
                  </Box>
                  <TextField
                    label="Title"
                    helperText="Required. Use a clear guide title."
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Slug"
                    helperText="Required and unique. Example: beginner-guide."
                    value={form.slug}
                    onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    helperText="Short summary shown on public cards and search results."
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <TextField
                    label="Facebook source URL"
                    helperText="Optional, but recommended for attribution."
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
                </Stack>
              </Paper>

              {editingPost ? (
                <>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(111, 102, 85, 0.14)', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 800 }}>Step 2: Content blocks</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                      Add text, highlights, images, and videos. Reorder blocks to control the public post detail page.
                    </Typography>
                  </Paper>
                  <ContentBlockBuilder postId={editingPost.id} />
                </>
              ) : (
                <Paper elevation={0} sx={{ p: 2, border: '1px dashed rgba(111, 102, 85, 0.22)', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>Step 2: Content blocks</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Save the post first. After creation, this dialog will stay open so you can add content blocks immediately.
                  </Typography>
                </Paper>
              )}

              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(111, 102, 85, 0.14)', borderRadius: 2, bgcolor: '#fff8e8' }}>
                <Typography sx={{ fontWeight: 800 }}>Step 3: Images / Video</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Use Image or Video blocks to upload new media, choose from the media library, or paste an external URL.
                </Typography>
              </Paper>
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
