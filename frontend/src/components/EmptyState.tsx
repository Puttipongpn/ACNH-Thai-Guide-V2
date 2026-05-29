import { Paper, Stack, Typography } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        border: '1px dashed rgba(111, 102, 85, 0.22)',
        bgcolor: 'rgba(255, 253, 244, 0.78)',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <LocalFloristIcon color="primary" />
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{message}</Typography>
      </Stack>
    </Paper>
  );
}
