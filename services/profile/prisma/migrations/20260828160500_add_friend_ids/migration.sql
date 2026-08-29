-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "friendIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
