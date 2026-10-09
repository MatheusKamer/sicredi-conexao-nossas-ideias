'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  Box,
  ButtonBase,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import GroupRounded from '@mui/icons-material/GroupRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded';
import { useAuth } from '@/lib/auth/auth-provider';
import { initials } from '@/lib/format';
import { useRequestsSummary } from '@/lib/queries/requests';
import { ROLE_LABEL } from '@/lib/requests/labels';

export const SIDEBAR_WIDTH = 256;

type NavItemProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  onNavigate?: () => void;
};

function NavItem({ label, icon, href, badge, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const selected = Boolean(href && (pathname === href || pathname.startsWith(`${href}/`)));

  const content = (
    <>
      <ListItemIcon sx={{ minWidth: 36, '& svg': { fontSize: 22 } }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        slotProps={{
          primary: { sx: { fontSize: 14, fontWeight: selected ? 600 : 500 } },
        }}
      />
      {badge !== undefined && badge > 0 && (
        <Chip
          label={badge}
          size="small"
          sx={{
            height: 20,
            bgcolor: 'primary.light',
            color: 'primary.main',
            fontSize: 12,
            fontWeight: 600,
          }}
        />
      )}
    </>
  );

  if (!href) {
    return (
      <Tooltip title="Em breve" placement="right" describeChild>
        <span>
          <ListItemButton disabled sx={{ height: 44, px: 1.5 }}>
            {content}
          </ListItemButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={selected}
      onClick={onNavigate}
      sx={{ height: 44, px: 1.5 }}
    >
      {content}
    </ListItemButton>
  );
}

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="overline"
        component="p"
        sx={{ display: 'block', color: 'muted', px: 1.5, mb: 0.5 }}
      >
        {title}
      </Typography>
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {children}
      </List>
    </Box>
  );
}

function UserCard() {
  const { user, signout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-haspopup="menu"
        aria-label="Menu do usuário"
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          gap: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'background.default',
          textAlign: 'left',
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 13, fontWeight: 600 }}>
          {initials(user?.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user ? (user.name ?? user.email) : <Skeleton width={100} />}
          </Typography>
          <Typography variant="caption" noWrap component="p" sx={{ color: 'text.secondary' }}>
            {user ? ROLE_LABEL[user.role] : <Skeleton width={60} />}
          </Typography>
        </Box>
        <UnfoldMoreRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            signout();
          }}
        >
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: summary } = useRequestsSummary();
  const openCount = summary ? summary.byStatus.PENDING + summary.byStatus.UNDER_REVIEW : undefined;

  return (
    <Stack
      component="nav"
      aria-label="Navegação principal"
      spacing={3.5}
      sx={{ width: '100%', minHeight: '100%', px: 2, py: 2.5, bgcolor: 'background.paper' }}
    >
      <Box sx={{ px: 1 }}>
        <Image
          src="/sicredi-logo.png"
          alt="Sicredi"
          width={136}
          height={32}
          priority
          style={{ height: 32, width: 'auto' }}
        />
        <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Central de Solicitações
        </Typography>
      </Box>

      <Stack spacing={3} sx={{ flex: 1 }}>
        <NavGroup title="Principal">
          <NavItem
            label="Dashboard"
            href="/dashboard"
            icon={<DashboardRounded />}
            onNavigate={onNavigate}
          />
          <NavItem
            label="Solicitações"
            href="/solicitacoes"
            icon={<AssignmentRounded />}
            badge={openCount}
            onNavigate={onNavigate}
          />
        </NavGroup>
        <NavGroup title="Administração">
          <NavItem label="Usuários e acessos" icon={<GroupRounded />} />
          <NavItem label="Configurações" icon={<SettingsRounded />} />
        </NavGroup>
      </Stack>

      <UserCard />
    </Stack>
  );
}
