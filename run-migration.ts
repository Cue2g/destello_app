import prisma from "./lib/prisma";

async function main() {
  const sql = `
    DROP TABLE IF EXISTS "EmailConfig" CASCADE;

    ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "ownerId" INTEGER;

    CREATE TABLE IF NOT EXISTS "EmailConfig" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "host" TEXT NOT NULL,
        "port" INTEGER NOT NULL DEFAULT 993,
        "userEmail" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "useTls" BOOLEAN NOT NULL DEFAULT true,
        "lastChecked" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "WahaConfig" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "apiUrl" TEXT NOT NULL,
        "apiKey" TEXT,
        "sessionName" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "WahaConfig_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "EmailConfig_userId_key" ON "EmailConfig"("userId");
    CREATE UNIQUE INDEX IF NOT EXISTS "WahaConfig_userId_key" ON "WahaConfig"("userId");

    ALTER TABLE "Candidate" ADD CONSTRAINT IF NOT EXISTS "Candidate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    ALTER TABLE "EmailConfig" ADD CONSTRAINT IF NOT EXISTS "EmailConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "WahaConfig" ADD CONSTRAINT IF NOT EXISTS "WahaConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  `;

  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("Migration applied successfully");
  } catch (err: unknown) {
    console.error("Error:", (err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
