import { Alert } from '@mui/material';

type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return <Alert severity="info">{message}</Alert>;
}
