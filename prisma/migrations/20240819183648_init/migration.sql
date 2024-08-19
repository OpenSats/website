-- CreateEnum
CREATE TYPE "FundSlug" AS ENUM ('monero', 'firo', 'privacyguides', 'general');

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "btcPayInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeSubscriptionId" TEXT,
    "projectSlug" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "fundSlug" "FundSlug" NOT NULL,
    "cryptoCode" TEXT,
    "fiatAmount" DOUBLE PRECISION NOT NULL,
    "cryptoAmount" DOUBLE PRECISION,
    "membershipExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_btcPayInvoiceId_key" ON "Donation"("btcPayInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripeInvoiceId_key" ON "Donation"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Donation_stripePaymentIntentId_idx" ON "Donation"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Donation_stripeSubscriptionId_idx" ON "Donation"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");
