import { Paper, Stack, Typography } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { publicPalette } from '../theme/appTheme';

type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 3, md: 4 },
        py: { xs: 5, md: 6 },
        border: '1px dashed rgba(146, 189, 145, 0.45)',
        bgcolor: 'rgba(255, 253, 244, 0.72)',
        borderRadius: 6,
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <LocalFloristIcon color="primary" sx={{ fontSize: 34 }} />
        <Typography variant="h6" sx={{ fontSize: 19 }}>
          ยังไม่มีบันทึกตรงนี้
        </Typography>
        <Typography sx={{ color: publicPalette.muted, lineHeight: 1.8, maxWidth: 520 }}>{message}</Typography>
      </Stack>
    </Paper>
  );
}
