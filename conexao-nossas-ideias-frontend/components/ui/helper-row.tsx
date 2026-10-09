import { Box, Stack } from '@mui/material';

/**
 * TextField helper row from the design: helper (or error) text on the left, character counter on the
 * right. Pass it as `helperText` together with `slotProps={{ formHelperText: { component: 'div' } }}`.
 */
export function HelperRow({ text, count, max }: { text?: string; count: number; max: number }) {
  return (
    <Stack direction="row" spacing={2} component="span" sx={{ justifyContent: 'space-between' }}>
      <span>{text}</span>
      <Box component="span" sx={{ flexShrink: 0 }}>
        {count}/{max}
      </Box>
    </Stack>
  );
}
