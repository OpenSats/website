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
    "grossCryptoAmount" DOUBLE PRECISION,
    "netCryptoAmount" DOUBLE PRECISION,
    "grossFiatAmount" DOUBLE PRECISION NOT NULL,
    "netFiatAmount" DOUBLE PRECISION NOT NULL,
    "pointsAdded" INTEGER NOT NULL DEFAULT 0,
    "membershipExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAddresses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "fundSlug" "FundSlug" NOT NULL,
    "btcPayInvoiceId" TEXT NOT NULL,
    "bitcoinAddress" TEXT NOT NULL,
    "moneroAddress" TEXT NOT NULL,

    CONSTRAINT "ProjectAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripeInvoiceId_key" ON "Donation"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Donation_btcPayInvoiceId_idx" ON "Donation"("btcPayInvoiceId");

-- CreateIndex
CREATE INDEX "Donation_stripePaymentIntentId_idx" ON "Donation"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Donation_stripeSubscriptionId_idx" ON "Donation"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAddresses_projectSlug_fundSlug_key" ON "ProjectAddresses"("projectSlug", "fundSlug");
