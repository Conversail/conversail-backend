/*
  Warnings:

  - You are about to drop the column `user1Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `ChatPreferences` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `connection1Id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connection2Id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "ChatPreferences" DROP CONSTRAINT "ChatPreferences_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ReportJudgment" DROP CONSTRAINT "ReportJudgment_reportId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "connection1Id" TEXT NOT NULL,
ADD COLUMN     "connection2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reason" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChatPreferences";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_connection1Id_fkey" FOREIGN KEY ("connection1Id") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_connection2Id_fkey" FOREIGN KEY ("connection2Id") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportJudgment" ADD CONSTRAINT "ReportJudgment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
