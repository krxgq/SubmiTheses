-- Add scale_id column to grades table
ALTER TABLE "public"."grades" ADD COLUMN "scale_id" BIGINT;

-- Add foreign key constraint
ALTER TABLE "public"."grades"
ADD CONSTRAINT "grades_scale_id_fkey"
FOREIGN KEY ("scale_id") REFERENCES "public"."scales"("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add index for better query performance
CREATE INDEX "grades_scale_id_idx" ON "public"."grades"("scale_id");
