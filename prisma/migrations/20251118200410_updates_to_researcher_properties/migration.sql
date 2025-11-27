DO $$
BEGIN
ALTER TABLE "Researcher" ADD COLUMN "country" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END;
$$;

DO $$
BEGIN
ALTER TABLE "Researcher" ADD COLUMN "description" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END;
$$;

DO $$
BEGIN
ALTER TABLE "Researcher" ADD COLUMN "therapeuticsOfInterest" TEXT[];
EXCEPTION WHEN duplicate_column THEN NULL;
END;
$$;

DO $$
BEGIN
ALTER TABLE "Researcher" ADD COLUMN "website" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END;
$$;
