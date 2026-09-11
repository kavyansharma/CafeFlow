-- ==========================================================
-- Migration: 001_add_business_type_to_cafes.sql
-- Purpose: Safely add business_type to existing cafes table
-- Backward Compatibility: Fully safe, non-destructive, default 'restaurant'
-- ==========================================================

-- 1. Add column if it does not exist (idempotent)
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'restaurant';

-- 2. Populate any NULL records with appropriate default
UPDATE cafes SET business_type = 'restaurant' WHERE business_type IS NULL;

-- 3. Add index for tenant analytics & concept reporting
CREATE INDEX IF NOT EXISTS idx_cafes_business_type ON cafes(business_type);
