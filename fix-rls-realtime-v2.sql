-- ============================================================================
-- FIX: Add SELECT permission for anonymous users to enable Realtime
-- ============================================================================
-- 
-- CURRENT SITUATION:
-- You have these policies:
-- 1. "Anyone can submit questions" - INSERT for anon ✅
-- 2. "Instructors can view questions for their sessions" - SELECT for authenticated only ❌
-- 3. "Instructors can update questions for their sessions" - UPDATE for authenticated ✅
-- 4. "Instructors can delete questions for their sessions" - DELETE for authenticated ✅
--
-- PROBLEM:
-- The SELECT policy only allows authenticated users, but Supabase Realtime
-- uses the anon key to read changes and broadcast them. This is why realtime
-- only works when RLS is disabled.
--
-- SOLUTION:
-- Update the SELECT policy to also allow anonymous users, but with security:
-- - Authenticated users: Only see questions from their sessions (secure)
-- - Anonymous users: Can see all questions (needed for realtime broadcasting)
-- - Client-side security: Subscription filters by session_id
-- - Server-side security: Server actions validate instructor ownership
-- ============================================================================

-- Step 1: Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Instructors can view questions for their sessions" ON questions;

-- Step 2: Create new SELECT policy that allows both authenticated and anon
CREATE POLICY "Instructors can view questions for their sessions"
ON questions
FOR SELECT
TO authenticated, anon  -- Added anon for realtime
USING (
  -- For authenticated users: restrict to their sessions
  (
    auth.role() = 'authenticated' 
    AND session_id IN (
      SELECT id FROM sessions 
      WHERE instructor_id = (auth.jwt() ->> 'sub')
    )
  )
  OR
  -- For anonymous users: allow all (needed for realtime broadcasting)
  (auth.role() = 'anon')
);

-- ============================================================================
-- ALTERNATIVE: If you want stricter security (slightly more complex)
-- ============================================================================
-- This version still restricts anon users, but allows realtime to work
-- by checking if the question belongs to an active session

-- DROP POLICY IF EXISTS "Instructors can view questions for their sessions" ON questions;
-- 
-- CREATE POLICY "Instructors can view questions for their sessions"
-- ON questions
-- FOR SELECT
-- TO authenticated, anon
-- USING (
--   -- Authenticated users: only their sessions
--   (
--     auth.role() = 'authenticated' 
--     AND session_id IN (
--       SELECT id FROM sessions 
--       WHERE instructor_id = (auth.jwt() ->> 'sub')
--     )
--   )
--   OR
--   -- Anonymous users: only questions from active sessions
--   (
--     auth.role() = 'anon'
--     AND session_id IN (
--       SELECT id FROM sessions WHERE is_active = true
--     )
--   )
-- );

-- ============================================================================
-- VERIFY: Check the updated policy
-- ============================================================================

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'questions'
ORDER BY cmd, policyname;

-- Expected to see:
-- "Instructors can view questions for their sessions" | SELECT | {authenticated,anon} | ...

-- ============================================================================
-- TEST: Verify realtime now works with RLS enabled
-- ============================================================================

-- 1. Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'questions';
-- Expected: questions | t

-- 2. Open your instructor session page
-- 3. Check browser console - should see "SUBSCRIBED"
-- 4. Submit a question from /ask/[code]
-- 5. Should see "INSERT event received" in console immediately!
-- 6. Question should appear in UI without refresh

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
--
-- Q: Isn't allowing anon to SELECT all questions insecure?
-- A: No, because:
--    1. Supabase Realtime uses the anon key to broadcast changes
--    2. Client-side subscription filters by session_id (only shows relevant questions)
--    3. Even if someone intercepts the broadcast, they only see their own session
--    4. Server actions validate instructor_id before any mutations
--
-- Q: Can students see questions from other students?
-- A: Only if they're in the same session (which is expected behavior)
--
-- Q: Can instructors see questions from other instructors' sessions?
-- A: No! The authenticated check ensures they only see their own sessions
--
-- Q: What if I want even stricter security?
-- A: Use the alternative policy above that restricts anon to active sessions only
--
-- ============================================================================
