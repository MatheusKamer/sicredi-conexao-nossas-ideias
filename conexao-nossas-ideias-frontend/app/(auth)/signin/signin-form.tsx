'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import HelpRounded from '@mui/icons-material/HelpRounded';
import LoginRounded from '@mui/icons-material/LoginRounded';
import MailRounded from '@mui/icons-material/MailRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';

// Mirrors the backend SigninDto.
const signinSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

type SigninValues = z.infer<typeof signinSchema>;

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'E-mail ou senha inválidos.';
    if (error.status === 0) return error.message;
  }
  return 'Não foi possível entrar. Tente novamente em instantes.';
}

const comingSoon = 'Em breve';

export function SigninForm({ redirectTo }: { redirectTo: string }) {
  const { signin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signin(values, redirectTo);
    } catch (error) {
      setSubmitError(errorMessage(error));
    }
  });

  const { ref: emailRef, ...emailField } = register('email');
  const { ref: passwordRef, ...passwordField } = register('password');

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 4,
        px: { xs: 3, sm: 8 },
        py: 6,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title={comingSoon} describeChild>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', color: 'text.secondary', cursor: 'default' }}
          >
            <HelpRounded sx={{ fontSize: 18 }} />
            <Typography variant="body2">Precisa de ajuda?</Typography>
          </Stack>
        </Tooltip>
      </Stack>

      <Stack component="form" noValidate onSubmit={onSubmit} spacing={4}>
        <Box>
          <Image
            src="/sicredi-logo.png"
            alt="Sicredi"
            width={170}
            height={40}
            priority
            style={{ height: 40, width: 'auto' }}
          />
        </Box>

        <Stack spacing={1}>
          <Typography variant="h1" sx={{ fontSize: 36 }}>
            Entrar
          </Typography>
          <Typography variant="subtitle1">
            Acesse com seu e-mail corporativo para continuar.
          </Typography>
        </Stack>

        <Stack spacing={3}>
          <TextField
            {...emailField}
            inputRef={emailRef}
            label="E-mail"
            type="email"
            placeholder="nome@sicredi.com.br"
            autoComplete="email"
            autoFocus
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <MailRounded sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            {...passwordField}
            inputRef={passwordRef}
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Tooltip title={comingSoon} describeChild>
              <FormControlLabel
                control={<Checkbox size="small" disabled />}
                label={<Typography variant="body2">Lembrar de mim</Typography>}
              />
            </Tooltip>
            <Tooltip title={comingSoon} describeChild>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 500, opacity: 0.6, cursor: 'default' }}
              >
                Esqueci minha senha
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          loading={isSubmitting}
          startIcon={<LoginRounded />}
        >
          Entrar
        </Button>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', color: 'text.secondary' }}>
        <Typography variant="caption">© 2026 Sicredi</Typography>
        <Typography variant="caption">Política de privacidade</Typography>
      </Stack>
    </Box>
  );
}
