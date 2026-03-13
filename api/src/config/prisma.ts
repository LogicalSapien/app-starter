import { PrismaClient } from "@prisma/client";
import config from "./config.js";

// Lazy initialization of Prisma client to ensure environment variables are loaded first
let prisma: PrismaClient | null = null;

/**
 * Lazily construct a Prisma client using the connection URL sourced from config.
 * The singleton pattern ensures environment variables are read before instantiation.
 */
const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    const databaseUrl = config.databaseUrl;

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: config.isDevelopment() ? ["info", "warn", "error"] : ["error"],
    });
  }
  return prisma;
};

/**
 * Execute the supplied Prisma operation with connection-aware retry handling.
 *
 * @param operation - Function that performs the Prisma action.
 * @param maxRetries - Maximum number of attempts before surfacing the error.
 * @param delay - Initial wait (ms) between attempts; doubles on every retry.
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      const isConnectionError =
        error.message.includes("Can't reach database server") ||
        error.message.includes("Connection terminated") ||
        error.message.includes("Connection timeout") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND");

      if (isConnectionError && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        break;
      }
    }
  }

  throw lastError;
};

/**
 * Proxy that wraps the Prisma client with retry-aware model operations while
 * keeping native helpers ($connect, $transaction, etc.) untouched.
 */
const enhancedPrisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    if (
      prop === "$connect" ||
      prop === "$disconnect" ||
      prop === "$on" ||
      prop === "$transaction" ||
      prop === "$queryRaw" ||
      prop === "$queryRawUnsafe" ||
      prop === "$executeRaw" ||
      prop === "$executeRawUnsafe" ||
      prop === "$extends"
    ) {
      const prismaClient = getPrismaClient();
      const fn = (prismaClient as any)[prop];
      return typeof fn === "function" ? fn.bind(prismaClient) : fn;
    }

    const prismaClient = getPrismaClient();
    const value = (prismaClient as any)[prop];

    if (typeof value === "object" && value !== null) {
      // For model operations (e.g., prisma.user, prisma.session)
      return new Proxy(value, {
        get(modelTarget: any, modelProp: PropertyKey) {
          const fn = modelTarget[modelProp];
          if (typeof fn === "function") {
            return async (...args: any[]) =>
              withRetry(() => fn.apply(modelTarget, args));
          }
          return fn;
        },
      });
    }

    return value;
  },
});

export default enhancedPrisma;
