-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "donorName" TEXT,
ADD COLUMN     "showDonorNameOnLeaderboard" BOOLEAN DEFAULT false;
