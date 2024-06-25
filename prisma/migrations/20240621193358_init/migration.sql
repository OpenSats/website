-- CreateTable
CREATE TABLE "CryptoDonation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "fund" TEXT NOT NULL,
    "crypto" TEXT NOT NULL,
    "fiatAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CryptoDonation_pkey" PRIMARY KEY ("id")
);
