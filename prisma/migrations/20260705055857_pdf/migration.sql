/*
  Warnings:

  - You are about to drop the column `user` on the `EmailConfig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `EmailConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `EmailConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `EmailConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "EmailConfig" DROP COLUMN "user",
ADD COLUMN     "userEmail" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "WahaConfig" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "sessionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WahaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WahaConfig_userId_key" ON "WahaConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfig_userId_key" ON "EmailConfig"("userId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfig" ADD CONSTRAINT "EmailConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WahaConfig" ADD CONSTRAINT "WahaConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
