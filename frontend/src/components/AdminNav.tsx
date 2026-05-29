import { Button, Stack } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import ImageIcon from '@mui/icons-material/Image';
import LogoutIcon from '@mui/icons-material/Logout';
import SellIcon from '@mui/icons-material/Sell';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  onLogout: () => void;
  includeHome?: boolean;
};

export default function AdminNav({ onLogout, includeHome = true }: Props) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {includeHome && (
        <Button component={RouterLink} to="/" variant="outlined">
          Home
        </Button>
      )}
      <Button component={RouterLink} to="/admin/posts" variant="outlined" startIcon={<ArticleIcon />}>
        Posts
      </Button>
      <Button component={RouterLink} to="/admin/categories" variant="outlined" startIcon={<CategoryIcon />}>
        Categories
      </Button>
      <Button component={RouterLink} to="/admin/tags" variant="outlined" startIcon={<SellIcon />}>
        Tags
      </Button>
      <Button component={RouterLink} to="/admin/media" variant="outlined" startIcon={<ImageIcon />}>
        Media
      </Button>
      <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout}>
        Logout
      </Button>
    </Stack>
  );
}
