import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create Prisma client with proper configuration for connection pooling
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client.$extends(withAccelerate());
};

// Declare the global prisma variable type
declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

// Ensure single instance of Prisma Client in development
const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
