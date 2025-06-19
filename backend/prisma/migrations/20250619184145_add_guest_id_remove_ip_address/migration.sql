/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `IdeaComment` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `IdeaVote` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IdeaComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ideaId" INTEGER NOT NULL,
    "userId" INTEGER,
    "guestId" TEXT,
    "guestName" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeaComment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IdeaComment" ("content", "createdAt", "guestName", "id", "ideaId", "userId") SELECT "content", "createdAt", "guestName", "id", "ideaId", "userId" FROM "IdeaComment";
DROP TABLE "IdeaComment";
ALTER TABLE "new_IdeaComment" RENAME TO "IdeaComment";
CREATE TABLE "new_IdeaVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ideaId" INTEGER NOT NULL,
    "userId" INTEGER,
    "guestId" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeaVote_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IdeaVote" ("createdAt", "id", "ideaId", "type", "userId") SELECT "createdAt", "id", "ideaId", "type", "userId" FROM "IdeaVote";
DROP TABLE "IdeaVote";
ALTER TABLE "new_IdeaVote" RENAME TO "IdeaVote";
CREATE UNIQUE INDEX "IdeaVote_ideaId_userId_key" ON "IdeaVote"("ideaId", "userId");
CREATE UNIQUE INDEX "IdeaVote_ideaId_guestId_key" ON "IdeaVote"("ideaId", "guestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
