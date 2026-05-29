import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { ContentBlock } from '../types/api';
import { publicPalette } from '../theme/appTheme';
import { resolveUploadUrl, softBorder, softShadow } from '../utils/publicStyle';

type Props = {
  block: ContentBlock;
};

const textSize = {
  small: { fontSize: 15, lineHeight: 1.75 },
  medium: { fontSize: 18, lineHeight: 1.8 },
  large: { fontSize: 23, lineHeight: 1.7, fontWeight: 700 },
};

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
  } catch {
    return '';
  }

  return '';
}

function isDirectVideoUrl(url: string) {
  const normalizedUrl = url.toLowerCase().split('?')[0];
  return normalizedUrl.endsWith('.mp4') || normalizedUrl.endsWith('.webm') || normalizedUrl.endsWith('.ogg');
}

export default function ContentBlockRenderer({ block }: Props) {
  if (block.type === 'TEXT_BLOCK') {
    const size = block.metadata.size ?? 'medium';
    return (
      <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', ...textSize[size] }}>
        {block.content}
      </Typography>
    );
  }

  if (block.type === 'IMAGE_BLOCK') {
    const layout = block.metadata.layout ?? 'full_width';
    const image = (
      <Box
        component="img"
        src={resolveUploadUrl(block.metadata.image_url)}
        alt={block.metadata.alt_text ?? ''}
        sx={{
          width: '100%',
          borderRadius: 4,
          display: 'block',
          objectFit: 'cover',
          maxHeight: layout === 'full_width' ? 520 : 360,
          border: softBorder,
          bgcolor: publicPalette.creamDeep,
        }}
      />
    );
    const text = (
      <Stack spacing={1.25}>
        {block.metadata.caption && (
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            {block.metadata.caption}
          </Typography>
        )}
        {block.metadata.text && (
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {block.metadata.text}
          </Typography>
        )}
      </Stack>
    );

    if (layout === 'left_image' || layout === 'right_image') {
      return (
        <Stack
          direction={{ xs: 'column', md: layout === 'left_image' ? 'row' : 'row-reverse' }}
          spacing={2.5}
          alignItems="center"
        >
          <Box sx={{ flex: 1, width: '100%' }}>{image}</Box>
          <Box sx={{ flex: 1, width: '100%' }}>{text}</Box>
        </Stack>
      );
    }

    return (
      <Stack spacing={1.25}>
        {image}
        {text}
      </Stack>
    );
  }

  if (block.type === 'VIDEO_BLOCK') {
    const videoUrl = block.metadata.url ?? '';
    const resolvedVideoUrl = resolveUploadUrl(videoUrl);
    const embedUrl = youtubeEmbedUrl(videoUrl);
    return (
      <Stack spacing={1.5}>
        {block.metadata.title && (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {block.metadata.title}
          </Typography>
        )}
        {embedUrl ? (
          <Box
            component="iframe"
            src={embedUrl}
            title={block.metadata.title ?? 'Video'}
            sx={{
              width: '100%',
              aspectRatio: '16 / 9',
              border: 0,
              borderRadius: 4,
              boxShadow: '0 12px 28px rgba(83, 111, 87, 0.14)',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isDirectVideoUrl(videoUrl) ? (
          <Box
            component="video"
            src={resolvedVideoUrl}
            controls
            sx={{
              width: '100%',
              borderRadius: 4,
              border: softBorder,
              boxShadow: '0 12px 28px rgba(83, 111, 87, 0.14)',
            }}
          />
        ) : (
          <Button
            href={resolvedVideoUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Open video
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        bgcolor: 'rgba(251, 240, 202, 0.72)',
        border: '1px solid rgba(241, 229, 201, 0.9)',
        borderRadius: 5,
        boxShadow: softShadow,
      }}
    >
      <Stack spacing={1}>
        {block.metadata.title && (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {block.metadata.title}
          </Typography>
        )}
        <Typography sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{block.content}</Typography>
      </Stack>
    </Paper>
  );
}
