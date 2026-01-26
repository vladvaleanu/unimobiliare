/**
 * @unimobiliare/database
 *
 * Database client and utilities.
 * Re-exports Prisma Client for use in other packages.
 */

import { PrismaClient } from '@prisma/client';

// Re-export Prisma Client and types
export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

// Singleton instance for the application
let prisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient({
            log: process.env['NODE_ENV'] === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }
    return prisma;
}

export async function disconnectPrisma(): Promise<void> {
    if (prisma) {
        await prisma.$disconnect();
        prisma = undefined;
    }
}
