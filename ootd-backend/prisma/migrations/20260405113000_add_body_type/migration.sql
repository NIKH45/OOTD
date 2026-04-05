-- Add optional body type to support post-signup profile completion flow.
ALTER TABLE "User"
ADD COLUMN "bodyType" TEXT;
