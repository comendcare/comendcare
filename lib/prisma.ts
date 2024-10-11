// prisma.ts

import {db} from "@/app/api/db"
import {PrismaClient} from "@prisma/client"; // Import the `db` exported from your `db.ts`

// Re-assign `db` to `global.prisma` in development to avoid re-instantiating Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || db;  // Use the `db` exported from `db.ts`

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
