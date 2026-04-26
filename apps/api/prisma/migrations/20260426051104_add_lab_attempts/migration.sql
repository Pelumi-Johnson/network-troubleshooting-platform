-- CreateTable
CREATE TABLE "LabAttempt" (
    "id" TEXT NOT NULL,
    "labSlug" TEXT NOT NULL,
    "userId" TEXT,
    "score" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabAttempt" ADD CONSTRAINT "LabAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
