import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { ContentBlock } from '../types/api';

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
        src={block.metadata.image_url}
        alt={block.metadata.alt_text ?? ''}
        sx={{
          width: '100%',
          borderRadius: 2,
          display: 'block',
          objectFit: 'cover',
          maxHeight: layout === 'full_width' ? 520 : 360,
          border: '1px solid rgba(111, 102, 85, 0.12)',
        }}
      />
    );
    const text = (
      <Stack spacing={1.25}>
        {block.metadata.caption && (
          <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{block.metadata.caption}</Typography>
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
              borderRadius: 2,
              boxShadow: '0 12px 28px rgba(154, 197, 216, 0.22)',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Button
            href={videoUrl}
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
        p: { xs: 2, md: 3 },
        bgcolor: '#e5f4dc',
        border: '1px solid rgba(127, 183, 126, 0.28)',
        boxShadow: '0 12px 30px rgba(127, 183, 126, 0.18)',
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
