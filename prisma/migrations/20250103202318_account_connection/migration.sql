-- CreateEnum
CREATE TYPE "AccountConnectionType" AS ENUM ('privacyGuidesForum');

-- CreateTable
CREATE TABLE "AccountConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AccountConnectionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "privacyGuidesAccountIsInMemberGroup" BOOLEAN,

    CONSTRAINT "AccountConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountConnection_userId_idx" ON "AccountConnection"("userId");

-- CreateIndex
CREATE INDEX "AccountConnection_externalId_idx" ON "AccountConnection"("externalId");
