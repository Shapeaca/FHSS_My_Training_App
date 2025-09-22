import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { appRouter } from './server/api/api.routes';
import { createContext } from './server/api/trpc';
import {
  heartbeatHandler,
  readyHandlerFactory,
  loginHandler,
  proxyHandlerFactory,
  whoAmIHandlerFactory,
  logoutHandler,
  ssoCallbackHandlerFactory,
  dummyPluginFactory,
  jwt,
} from '@fhss-web-team/backend-utils';
import { dummyFunctions } from './server/dummy/dummy.functions';
import { prisma } from '../prisma/client';
import { userService } from './server/services/user';
import { DEFAULT_HOME_PAGES } from './security';
import { cronJobs } from './server/cron/cron.jobs';

const port = parseInt(process.env['PORT'] ?? '') || 4000;
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

jwt.setPrisma(prisma);
cronJobs.forEach(job => job.start());

const angularApp = new AngularNodeAppEngine();
const app = Fastify({ logger: true });
app.register(cookie);
app.register(formbody);

export type AppRouter = typeof appRouter;

/**
 * Serve static files from /browser
 */
app.register(fastifyStatic, {
  root: browserDistFolder,
  prefix: '/',
  wildcard: false,
  index: false,
  maxAge: '1y',
});

/**
 * tRPC Adapter
 */
app.register(fastifyTRPCPlugin, {
  prefix: '/api',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
});

/**
 * HTTP endpoints
 */
app.get('/sys/heartbeat', heartbeatHandler);
app.get('/sys/ready', readyHandlerFactory(prisma));
app.get('/sys/who-am-i', whoAmIHandlerFactory(userService));
app.get('/login', loginHandler);
app.get('/logout', logoutHandler);
app.get('/proxy', proxyHandlerFactory(userService, DEFAULT_HOME_PAGES));
app.post('/SSO/assertion', ssoCallbackHandlerFactory(userService, DEFAULT_HOME_PAGES));

/**
 * Dummy endpoints
 */
if (['dev', 'staging'].includes(process.env['ENVIRONMENT'] ?? 'no')) {
  app.register(dummyPluginFactory(dummyFunctions));
}

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('/*', async (request, reply) => {
  try {
    const ssrResponse = await angularApp.handle(request.raw);
    if (ssrResponse) {
      await writeResponseToNodeResponse(ssrResponse, reply.raw);
    } else {
      return reply.callNotFound();
    }
  } catch (err) {
    reply.send(err);
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  app.listen({ port, host: '0.0.0.0' }, err => {
    if (err) {
      app.log.error(err);
      if (process.env['ENVIRONMENT'] === 'dev') {
        console.error(err);
      }
      process.exit(1);
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
});
