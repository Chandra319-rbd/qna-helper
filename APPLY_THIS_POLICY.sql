-- ============================================================================
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================================================
-- This will update your SELECT policy to allow Supabase Realtime to work
-- while keeping your data secure
-- ============================================================================

-- Step 1: Drop the old SELECT policy
DROP POLICY IF EXISTS "Instructors can view questions for their sessions" ON questions;

-- Step 2: Create the new SELECT policy that allows both authenticated and anon
CREATE POLICY "Instructors can view questions for their sessions"
ON questions
FOR SELECT
TO authenticated, anon
USING (
  (
    auth.role() = 'authenticated' 
    AND session_id IN (
      SELECT id FROM sessions 
      WHERE instructor_id = (auth.jwt() ->> 'sub')
    )
  )
  OR
  (auth.role() = 'anon')
);

-- ============================================================================
-- DONE! Now test:
-- 1. Open your instructor session page
-- 2. Submit a question from /ask/[code] in another tab
-- 3. Question should appear instantly without refresh!
-- ============================================================================
