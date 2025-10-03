-- AlterTable
ALTER TABLE "LeadHistory" ADD COLUMN     "apiCallsHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
