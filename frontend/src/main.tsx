import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './pages/App';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminMediaPage from './pages/AdminMediaPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminTagsPage from './pages/AdminTagsPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import PostDetailPage from './pages/PostDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PublicLayout from './layouts/PublicLayout';
import { appTheme } from './theme/appTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicLayout>
                <App />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/categories/:id"
            element={
              <PublicLayout>
                <CategoryPage />
              </PublicLayout>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <PublicLayout>
                <PostDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/search"
            element={
              <PublicLayout>
                <SearchResultsPage />
              </PublicLayout>
            }
          />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/tags" element={<AdminTagsPage />} />
          <Route path="/admin/media" element={<AdminMediaPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
