/*
  Warnings:

  - Changed the type of `courses` on the `Candidate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `education` on the `Candidate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `experience` on the `Candidate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "courses",
ADD COLUMN     "courses" JSONB NOT NULL,
DROP COLUMN "education",
ADD COLUMN     "education" JSONB NOT NULL,
DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB NOT NULL;
