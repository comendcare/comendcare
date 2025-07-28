-- CreateTable
CREATE TABLE "_RequestLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestLinks_AB_unique" ON "_RequestLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestLinks_B_index" ON "_RequestLinks"("B");

-- AddForeignKey
ALTER TABLE "_RequestLinks" ADD CONSTRAINT "_RequestLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestLinks" ADD CONSTRAINT "_RequestLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
