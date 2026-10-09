'use client';

import { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import { AppSidebar, SIDEBAR_WIDTH } from './app-sidebar';
import { AppTopbar } from './app-topbar';

/** Sidebar + top bar frame for every authenticated page. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, borderColor: 'divider' },
        }}
      >
        <AppSidebar />
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
      >
        <AppSidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppTopbar onOpenMenu={() => setMobileOpen(true)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: { xs: 2, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
