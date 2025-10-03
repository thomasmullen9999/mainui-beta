-- CreateTable
CREATE TABLE "migrationLog" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migrationLog_pkey" PRIMARY KEY ("key")
);
