-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StackDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stackId" TEXT NOT NULL,
    "dependsOnStackId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "StackDependency_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StackDependency" ("createdAt", "dependsOnStackId", "id", "notes", "stackId", "updatedAt") SELECT "createdAt", "dependsOnStackId", "id", "notes", "stackId", "updatedAt" FROM "StackDependency";
DROP TABLE "StackDependency";
ALTER TABLE "new_StackDependency" RENAME TO "StackDependency";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
