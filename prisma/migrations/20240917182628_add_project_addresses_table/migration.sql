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
CREATE UNIQUE INDEX "ProjectAddresses_projectSlug_key" ON "ProjectAddresses"("projectSlug");
