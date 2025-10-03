/*
  Warnings:

  - The `lead_status` column on the `LeadHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'nurture', 'sold');

-- AlterTable
ALTER TABLE "LeadHistory" DROP COLUMN "lead_status",
ADD COLUMN     "lead_status" "LeadStatus";
