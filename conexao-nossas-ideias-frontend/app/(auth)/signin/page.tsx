import type { Metadata } from 'next';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import { SigninForm } from './signin-form';

export const metadata: Metadata = { title: 'Entrar | Conexão Nossas Ideias' };

// Only same-origin paths are accepted, to avoid an open redirect via ?next=.
function safeRedirect(next: string | string[] | undefined) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/dashboard';
}

export default async function SigninPage({ searchParams }: PageProps<'/signin'>) {
  const { next } = await searchParams;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 490px' },
        minHeight: '100vh',
      }}
    >
      <Box
        component="section"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          p: 8,
          bgcolor: 'primary.dark',
        }}
      >
        <Image
          src="/login-art.webp"
          alt=""
          width={816}
          height={544}
          priority
          style={{ width: '100%', maxWidth: 816, height: 'auto' }}
        />
        <Box sx={{ maxWidth: 640 }}>
          <Typography
            sx={{ color: 'secondary.main', fontSize: 13, fontWeight: 500, letterSpacing: 2 }}
          >
            NOSSAS IDEIAS
          </Typography>
          <Typography
            component="p"
            variant="h1"
            sx={{ color: 'common.white', fontSize: { md: 40, lg: 48 }, mt: 2 }}
          >
            Toda grande mudança começa com uma boa ideia.
          </Typography>
          <Typography sx={{ color: 'rgb(255 255 255 / 80%)', fontSize: 16, mt: 2 }}>
            Registre, acompanhe e decida sobre as solicitações da sua cooperativa em um só lugar.
          </Typography>
        </Box>
      </Box>

      <SigninForm redirectTo={safeRedirect(next)} />
    </Box>
  );
}
