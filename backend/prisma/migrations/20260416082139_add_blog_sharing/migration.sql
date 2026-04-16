-- Add slug as nullable first to handle existing rows
  ALTER TABLE "Blog" ADD COLUMN "slug" TEXT;

  -- Generate slug from title + id suffix for existing rows
  UPDATE "Blog"
  SET "slug" = LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9 ]', '', 'g'),
      ' +', '-', 'g'
    )
  ) || '-' || SUBSTRING(id::text, 1, 6)
  WHERE "slug" IS NULL;

  -- Now enforce NOT NULL
  ALTER TABLE "Blog" ALTER COLUMN "slug" SET NOT NULL;

  -- Add unique index
  CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

  -- Add isPublic (has default so safe to add directly)
  ALTER TABLE "Blog" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;