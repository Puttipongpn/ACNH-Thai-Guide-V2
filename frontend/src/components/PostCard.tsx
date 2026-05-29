import { useEffect, useState } from 'react';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { listContentBlocks } from '../services/contentBlockService';
import type { ContentBlock, Post } from '../types/api';
import { getCategoryIcon, getPostImageInfo, softBorder } from '../utils/publicStyle';
import { publicPalette } from '../theme/appTheme';

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  const [imageInfo, setImageInfo] = useState({ coverImage: '', imageCount: 0 });

  useEffect(() => {
    let active = true;

    async function loadPostImages() {
      try {
        const response = await listContentBlocks(post.id);
        if (!active) return;
        const imageBlocks = response.data.filter((block: ContentBlock) => block.type === 'IMAGE_BLOCK');
        setImageInfo(getPostImageInfo(imageBlocks.map((block) => block.metadata)));
      } catch {
        if (active) setImageInfo({ coverImage: '', imageCount: 0 });
      }
    }

    void loadPostImages();

    return () => {
      active = false;
    };
  }, [post.id]);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: softBorder,
        boxShadow: '0 1px 3px rgba(62, 73, 62, 0.04)',
        bgcolor: publicPalette.paper,
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 36px rgba(83, 111, 87, 0.16)',
        },
      }}
    >
      <CardActionArea component={RouterLink} to={`/posts/${post.id}`} sx={{ height: '100%' }}>
        {imageInfo.coverImage && (
          <Box
            sx={{
              position: 'relative',
              height: 170,
              bgcolor: publicPalette.creamDeep,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={imageInfo.coverImage}
              alt=""
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Chip
              label={`${imageInfo.imageCount} รูป`}
              size="small"
              sx={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                bgcolor: 'rgba(255, 253, 244, 0.92)',
                color: publicPalette.leafDeep,
              }}
            />
          </Box>
        )}
        <CardContent sx={{ height: imageInfo.coverImage ? 'auto' : '100%' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`${getCategoryIcon(post.category)} ${post.category?.name ?? 'Guide'}`}
                size="small"
                color="primary"
              />
              {post.tags.slice(0, 2).map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" sx={{ bgcolor: publicPalette.leafPale }} />
              ))}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
              {post.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {post.description || 'A community guide waiting on the island notice board.'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 'auto' }}>
              อัปเดต {new Date(post.updated_at).toLocaleDateString('th-TH')}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
