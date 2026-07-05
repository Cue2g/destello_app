/*
  Warnings:

  - The `education` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `experience` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "courses" TEXT[],
ADD COLUMN     "skills" TEXT[],
DROP COLUMN "education",
ADD COLUMN     "education" TEXT[],
DROP COLUMN "experience",
ADD COLUMN     "experience" TEXT[];
