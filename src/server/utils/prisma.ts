import { TRPC_ERROR_CODE_KEY, TRPCError } from '@trpc/server';
import { Prisma } from '../../../prisma/client';

const makeErrorTypeCodeMap = <T extends TRPC_ERROR_CODE_KEY, C extends string>(map: TypeCodeMap<T, C>) => map;

/**
 * Maps TRPC error type identifiers to their corresponding Prisma error codes.
 * Feel free to add other codes that you encounter
 */
const errorTypeCodeMap = makeErrorTypeCodeMap({
  CONFLICT: 'P2002',
  NOT_FOUND: 'P2025',
});

/**
 * Determines if the provided error is a PrismaClientKnownRequestError of a specific TRPCError type.
 *
 * @param err - The error object to check.
 * @param type - The specific error type to match against.
 * @returns `true` if the error is a PrismaClientKnownRequestError and matches the specified type; otherwise, `false`.
 */
export const isPrismaError = (err: unknown, type: ErrorType) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === errorTypeCodeMap[type];

/**
 * Inspects an unknown error and rethrows it as a `TRPCError` if it matches a known Prisma error code.
 *
 * @param err - The error object to inspect and potentially rethrow.
 * @throws {TRPCError} If the error matches a known Prisma error code.
 */
export const rethrowKnownPrismaError = (err: unknown) => {
  for (const [type, code] of Object.entries(errorTypeCodeMap) as [ErrorType, ErrorCode][]) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === code) {
      throw new TRPCError({ code: type });
    }
  }
};

type TypeCodeMap<T extends TRPC_ERROR_CODE_KEY, C extends string> = Record<T, C>;
type ErrorType = keyof typeof errorTypeCodeMap;
type ErrorCode = (typeof errorTypeCodeMap)[ErrorType];
