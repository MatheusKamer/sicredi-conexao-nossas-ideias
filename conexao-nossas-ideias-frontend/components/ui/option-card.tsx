'use client';

import { Box, Radio, Stack } from '@mui/material';

type OptionCardProps = {
  value: string;
  checked: boolean;
  /** Palette color of the selected state (border + tinted background). */
  color?: 'primary' | 'error';
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  children: React.ReactNode;
};

/**
 * Selectable card from the status/decision dialogs: a radio on the left, free content on the right.
 * Must be rendered inside a RadioGroup, which provides the name and change handling.
 */
export function OptionCard({
  value,
  checked,
  color = 'primary',
  disabled,
  inputRef,
  children,
}: OptionCardProps) {
  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
        p: 2,
        pl: 1.25,
        border: 1,
        borderRadius: 1,
        borderColor: checked ? `${color}.main` : 'divider',
        bgcolor: checked ? `${color}.light` : 'background.paper',
        cursor: disabled ? 'default' : 'pointer',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': disabled || checked ? undefined : { borderColor: 'outline' },
        '&:has(.Mui-focusVisible)': { outline: 2, outlineColor: `${color}.main`, outlineOffset: 2 },
      }}
    >
      <Radio
        value={value}
        checked={checked}
        disabled={disabled}
        slotProps={{ input: { ref: inputRef } }}
        sx={{
          p: 0.5,
          mt: -0.5,
          color: 'outline',
          '&.Mui-checked': { color: `${color}.main` },
        }}
      />
      <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
        {children}
      </Stack>
    </Box>
  );
}
