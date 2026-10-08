'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { authApi, usersApi } from '@/lib/api/endpoints';
import type { SigninInput, User } from '@/lib/api/types';
import { queryKeys } from '@/lib/queries/requests';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
  subscribeToSession,
} from './session';

type AuthContextValue = {
  user: User | undefined;
  isLoadingUser: boolean;
  isManager: boolean;
  signin: (input: SigninInput, redirectTo?: string) => Promise<void>;
  signout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  // Server snapshot is always false so hydration matches; the client re-renders with the cookie value.
  const hasSession = useSyncExternalStore(
    subscribeToSession,
    () => Boolean(getSessionToken()),
    () => false,
  );

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.me,
    queryFn: usersApi.me,
    enabled: hasSession,
    staleTime: Infinity,
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router, pathname]);

  const signin = useCallback(
    async (input: SigninInput, redirectTo = '/dashboard') => {
      const { accessToken } = await authApi.signin(input);
      setSessionToken(accessToken);
      await queryClient.fetchQuery({ queryKey: queryKeys.me, queryFn: usersApi.me });
      router.replace(redirectTo);
    },
    [queryClient, router],
  );

  const signout = useCallback(() => {
    clearSessionToken();
    queryClient.clear();
    router.replace('/signin');
  }, [queryClient, router]);

  const value = useMemo(
    () => ({
      user,
      isLoadingUser,
      isManager: user?.role === 'MANAGER',
      signin,
      signout,
    }),
    [user, isLoadingUser, signin, signout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
