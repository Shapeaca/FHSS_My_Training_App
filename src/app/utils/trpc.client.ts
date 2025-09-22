import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { createTRPCClient, httpLink } from '@trpc/client';
import SuperJSON from 'superjson';
import type { AppRouter } from '../../server';
import { isPlatformBrowser } from '@angular/common';

export const TRPC_CLIENT = new InjectionToken<ReturnType<typeof getClient>>('TRPC_CLIENT');

const getClient = () => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${isBrowser ? window.location.origin : 'server'}/api`,
        transformer: SuperJSON,
      }),
    ],
  });
};

export const provideTrpc = () => ({
  provide: TRPC_CLIENT,
  useFactory: getClient
})
