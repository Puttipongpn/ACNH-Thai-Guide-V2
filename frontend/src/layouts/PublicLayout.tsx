import { ReactNode } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Link,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, NavLink } from 'react-router-dom';
import { publicPalette, publicTheme } from '../theme/appTheme';
import { publicShellBackground, softBorder, softShadow } from '../utils/publicStyle';

type Props = {
  children: ReactNode;
};

const navItems = [
  { label: 'หน้าแรก', path: '/', icon: <HomeIcon fontSize="small" /> },
  { label: 'ค้นหา', path: '/search', icon: <SearchIcon fontSize="small" /> },
  { label: 'Admin', path: '/admin/posts', icon: <AdminPanelSettingsIcon fontSize="small" /> },
];

export default function PublicLayout({ children }: Props) {
  return (
    <ThemeProvider theme={publicTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: publicPalette.cream, background: publicShellBackground }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(251, 247, 237, 0.92)',
            color: 'text.primary',
            borderBottom: '1px solid rgba(146, 189, 145, 0.18)',
            backdropFilter: 'blur(14px)',
          }}
        >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 76 }, gap: 2 }}>
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ color: 'inherit', textDecoration: 'none', minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 4,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: publicPalette.leaf,
                  boxShadow: softShadow,
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                🏝️
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.05, fontSize: { xs: 17, sm: 19 } }}>
                  ACNH Thai Guide
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, display: { xs: 'none', sm: 'block' } }}>
                  สมุดสารบัญกลุ่ม
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.75} sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: 'text.secondary',
                    px: 1.75,
                    '&.active': {
                      bgcolor: publicPalette.paper,
                      color: publicPalette.ink,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Toolbar>
        </Container>
        </AppBar>

        <Box component="main" sx={{ pb: { xs: 10, sm: 0 } }}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            borderTop: '1px solid rgba(146, 189, 145, 0.16)',
            bgcolor: 'rgba(255, 253, 244, 0.5)',
            py: { xs: 5, sm: 4 },
            textAlign: 'center',
          }}
        >
        <Container maxWidth="lg">
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            ACNH Thai Guide Index
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 14 }}>
            สมุดสารบัญชุมชน สำหรับเก็บไกด์ดี ๆ ให้หาเจออีกครั้ง
          </Typography>
        </Container>
        </Box>

        <Box
          component="nav"
          aria-label="ทางลัดมือถือ"
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar + 1,
            display: { xs: 'grid', sm: 'none' },
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0.5,
            px: 1,
            pt: 0.75,
            pb: 'max(0.45rem, env(safe-area-inset-bottom))',
            bgcolor: 'rgba(255, 253, 244, 0.96)',
            borderTop: softBorder,
            backdropFilter: 'blur(14px)',
          }}
        >
        {navItems.map((item) => (
          <Link
            key={item.path}
            component={NavLink}
            to={item.path}
            underline="none"
            sx={{
              color: 'text.secondary',
              borderRadius: 3,
              py: 0.8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              fontSize: 11,
              fontWeight: 700,
              '&.active': {
                bgcolor: publicPalette.leafPale,
                color: publicPalette.ink,
              },
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
