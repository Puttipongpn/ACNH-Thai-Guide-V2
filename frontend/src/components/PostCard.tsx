import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Post } from '../types/api';

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid rgba(111, 102, 85, 0.14)',
        boxShadow: '0 16px 34px rgba(127, 183, 126, 0.16)',
        bgcolor: '#fffdf4',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 38px rgba(127, 183, 126, 0.22)',
        },
      }}
    >
      <CardActionArea component={RouterLink} to={`/posts/${post.id}`} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={post.category?.name ?? 'Guide'} size="small" color="primary" />
              {post.tags.slice(0, 2).map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
              ))}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
              {post.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {post.description || 'A community guide waiting on the island notice board.'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 'auto' }}>
              Updated {new Date(post.updated_at).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
