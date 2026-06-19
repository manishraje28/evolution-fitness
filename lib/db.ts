import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient as GeneratedPrismaClient } from "../app/generated/prisma/client";

let prisma: GeneratedPrismaClient;

const dbUrl = "dev.db";

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  prisma = new GeneratedPrismaClient({ adapter });
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: GeneratedPrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    globalWithPrisma.prisma = new GeneratedPrismaClient({ adapter });
  }
  prisma = globalWithPrisma.prisma;
}

export { prisma };
export type * from "../app/generated/prisma/client";
