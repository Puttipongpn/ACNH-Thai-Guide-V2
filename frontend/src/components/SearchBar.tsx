import { FormEvent, useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { publicPalette } from '../theme/appTheme';
import { softBorder, softShadow } from '../utils/publicStyle';

type Props = {
  initialValue?: string;
  compact?: boolean;
  placeholder?: string;
};

export default function SearchBar({
  initialValue = '',
  compact = false,
  placeholder = 'ค้นหาไกด์, NPC, เดือน หรือ DLC...',
}: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchValue = query.trim();
    navigate(`/search${searchValue ? `?q=${encodeURIComponent(searchValue)}` : ''}`);
  }

  return (
    <Box
      component="form"
      role="search"
      onSubmit={submitSearch}
      sx={{
        maxWidth: compact ? 640 : '100%',
        bgcolor: publicPalette.paper,
        border: softBorder,
        borderColor: 'rgba(146, 189, 145, 0.28)',
        borderRadius: 4,
        p: 1,
        pl: { xs: 1, sm: 1.5 },
        boxShadow: compact ? 'none' : softShadow,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'transparent' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(81, 123, 88, 0.42)' },
            },
          }}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ px: 3, flexShrink: 0 }}>
          ค้นหา
        </Button>
      </Stack>
    </Box>
  );
}
