import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './pages/App';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminTagsPage from './pages/AdminTagsPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import PostDetailPage from './pages/PostDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import { appTheme } from './theme/appTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/tags" element={<AdminTagsPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
