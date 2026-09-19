-- Optional post-auth product survey answers.
-- These answers are broad product insights, not message or identity data.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "onboarding_country" text,
  ADD COLUMN IF NOT EXISTS "onboarding_device" text,
  ADD COLUMN IF NOT EXISTS "onboarding_source" text,
  ADD COLUMN IF NOT EXISTS "onboarding_goal" text,
  ADD COLUMN IF NOT EXISTS "onboarding_survey_completed_at" timestamptz;