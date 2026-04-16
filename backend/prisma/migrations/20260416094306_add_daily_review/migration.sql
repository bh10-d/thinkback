-- CreateTable
CREATE TABLE "DailyReview" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReview_date_key" ON "DailyReview"("date");

-- CreateIndex
CREATE INDEX "DailyReview_date_idx" ON "DailyReview"("date");

-- CreateIndex
CREATE INDEX "Note_topicId_idx" ON "Note"("topicId");

-- CreateIndex
CREATE INDEX "Note_nextReviewAt_idx" ON "Note"("nextReviewAt");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");
