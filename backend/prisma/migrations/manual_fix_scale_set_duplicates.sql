-- Fix duplicate scales in scale_set_scales table
-- Run this BEFORE prisma migrate to clean up existing duplicates

-- Step 1: Find and delete duplicate entries (keeps the one with lowest id)
DELETE FROM public.scale_set_scales
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.scale_set_scales
  GROUP BY scale_set_id, scale_id
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.scale_set_scales
ADD CONSTRAINT scale_set_scales_scale_set_id_scale_id_key
UNIQUE (scale_set_id, scale_id);
