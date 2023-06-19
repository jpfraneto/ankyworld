-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "addedToIPFS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tweeted" BOOLEAN NOT NULL DEFAULT false;
