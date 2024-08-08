-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('Waiting', 'Expired', 'Invalid', 'Complete');

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "btcPayInvoiceId" TEXT,
    "stripeInvoiceId" TEXT,
    "projectSlug" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "fund" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "fiatAmount" DOUBLE PRECISION NOT NULL,
    "membershipExpiresAt" TIMESTAMP(3),
    "status" "DonationStatus" NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donation_btcPayInvoiceId_idx" ON "Donation"("btcPayInvoiceId");

-- CreateIndex
CREATE INDEX "Donation_stripeInvoiceId_idx" ON "Donation"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");
