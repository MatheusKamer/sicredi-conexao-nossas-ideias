'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Badge,
  Box,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import HelpRounded from '@mui/icons-material/HelpRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/solicitacoes': 'Solicitações',
};

function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  // Ctrl/Cmd + K focuses the search, as hinted by the shortcut chip.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Box
      component="form"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const search = value.trim();
        router.push(search ? `/solicitacoes?search=${encodeURIComponent(search)}` : '/solicitacoes');
      }}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 1.25,
        width: 340,
        height: 40,
        px: 1.5,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    >
      <SearchRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar solicitações, ideias…"
        sx={{ flex: 1, fontSize: 14 }}
        slotProps={{ input: { 'aria-label': 'Buscar solicitações' } }}
      />
      <Box
        component="kbd"
        sx={{
          px: 0.75,
          py: '2px',
          fontSize: 11,
          fontFamily: 'inherit',
          color: 'text.secondary',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 0.5,
        }}
      >
        Ctrl K
      </Box>
    </Box>
  );
}

export function AppTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? '';

  return (
    <Stack
      component="header"
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        px: { xs: 2, md: 4 },
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label="Abrir menu"
          onClick={onOpenMenu}
          sx={{ display: { md: 'none' }, ml: -1 }}
        >
          <MenuRounded />
        </IconButton>
        <Stack
          component="ol"
          aria-label="Você está em"
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', listStyle: 'none', m: 0, p: 0 }}
        >
          <Typography component="li" variant="body2">
            <Box component={Link} href="/dashboard" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
              Início
            </Box>
          </Typography>
          <Box component="li" aria-hidden sx={{ display: 'flex', color: 'text.secondary' }}>
            <ChevronRightRounded sx={{ fontSize: 18 }} />
          </Box>
          <Typography component="li" variant="body2" aria-current="page" sx={{ fontWeight: 500 }}>
            {pageTitle}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <GlobalSearch />
        <Tooltip title="Notificações · em breve">
          <IconButton aria-label="Notificações">
            <Badge variant="dot" color="error" overlap="circular">
              <NotificationsRounded sx={{ color: 'text.secondary' }} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajuda · em breve">
          <IconButton aria-label="Ajuda">
            <HelpRounded sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
