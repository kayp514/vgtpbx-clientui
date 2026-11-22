import 'server-only'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Creates a Prisma client. The connection string defaults to DATABASE_URL from
 * the environment of the app that imports this package, so each app can
 * connect with its own database role.
 */
export function createPrismaClient(
    connectionString: string | undefined = process.env.DATABASE_URL,
): PrismaClient {
    const adapter = new PrismaPg({ connectionString })
    return new PrismaClient({ adapter })
}

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
