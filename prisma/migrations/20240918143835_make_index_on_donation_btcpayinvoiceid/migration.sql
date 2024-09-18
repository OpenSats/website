-- DropIndex
DROP INDEX "Donation_btcPayInvoiceId_key";

-- CreateIndex
CREATE INDEX "Donation_btcPayInvoiceId_idx" ON "Donation"("btcPayInvoiceId");
