import { initTRPC, TRPCError } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { Permission, Role, ROLE_PERMISSION_MAP } from '../../security';
import { prisma } from '../../../prisma/client';
import { authService } from '@fhss-web-team/backend-utils';
import superjson from 'superjson';

export const createContext = async (opts: CreateFastifyContextOptions) => ({
  userId: await authService.handleTokens(opts.req, opts.res),
});
type Context = Awaited<ReturnType<typeof createContext>>;
interface Meta { requiredPermissions: Permission[]; hasAll?: boolean }

const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({
    transformer: superjson,
    defaultMeta: { requiredPermissions: [] },
  });

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * A tRPC middleware procedure that ensures the request is authenticated.
 *
 * This procedure checks if a `userId` exists in the request context. If not, it throws an `UNAUTHORIZED` error.
 * It then verifies the existence of the user in the database using Prisma. If the user is not found, it throws an `UNAUTHORIZED` error.
 */
export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const typedUser = {
      ...user,
      roles: user.roles as Role[],
      permissions: user.permissions as Permission[],
    };

    return next({ ctx: { user: typedUser, userId: user.id } });
  },
);

/**
 * A tRPC middleware procedure that enforces authorization based on user roles and required permissions.
 *
 * This procedure wraps `authenticatedProcedure` and checks if the current user possesses at least one of the
 * permissions specified in the `meta.requiredPermissions` array.
 */
export const authorizedProcedure = authenticatedProcedure.use(
  ({ meta, ctx, next }) => {
    if (meta === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    const userPermissions = new Set(
      ctx.user.roles
        .flatMap((role) => ROLE_PERMISSION_MAP[role])
        .concat(ctx.user.permissions),
    );

    const strat = meta.hasAll ? 'every' : 'some';
    const hasRequiredPermission = meta.requiredPermissions[strat]((p) =>
      userPermissions.has(p),
    );

    if (!hasRequiredPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next();
  },
);
