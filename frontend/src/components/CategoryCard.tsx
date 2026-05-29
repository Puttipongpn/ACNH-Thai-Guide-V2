import { Card, CardActionArea, CardContent, Chip, Stack, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Category } from '../types/api';
import { getCategoryIcon, getCategoryTone, softBorder } from '../utils/publicStyle';
import { publicPalette } from '../theme/appTheme';

type Props = {
  category: Category;
  postCount?: number;
};

export default function CategoryCard({ category, postCount }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: 'rgba(255, 253, 244, 0.72)',
        border: softBorder,
        boxShadow: '0 1px 3px rgba(62, 73, 62, 0.04)',
        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 14px 28px rgba(83, 111, 87, 0.14)',
          bgcolor: publicPalette.paper,
        },
      }}
    >
      <CardActionArea component={RouterLink} to={`/categories/${category.id}`} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 4,
                  bgcolor: getCategoryTone(category),
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {getCategoryIcon(category)}
              </Box>
              {typeof postCount === 'number' && (
                <Chip label={`${postCount} ไกด์`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)' }} />
              )}
            </Stack>
            <Box>
              <Typography variant="h6" sx={{ fontSize: 19 }}>
                {category.name}
              </Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.75, fontSize: 14 }}>
                {category.description || 'รวมบันทึกชุมชนสำหรับหัวข้อนี้'}
              </Typography>
            </Box>
            <Typography sx={{ mt: 'auto', color: publicPalette.leafDeep, fontWeight: 800, fontSize: 14 }}>
              เปิดสารบัญ
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
