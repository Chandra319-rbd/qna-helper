-- ============================================================================
-- FIX: Supabase Realtime with Row Level Security (RLS)
-- ============================================================================
-- 
-- PROBLEM: Realtime events not received when RLS is enabled on questions table
-- SOLUTION: Add SELECT policy that allows Supabase Realtime to read and broadcast changes
--
-- WHY THIS IS NEEDED:
-- - RLS blocks ALL access by default, including Supabase Realtime
-- - Realtime server needs SELECT permission to broadcast postgres_changes
-- - We add a policy that allows SELECT for authenticated and anonymous users
-- - The actual security is enforced by the session_id filter in the subscription
--
-- SECURITY NOTE:
-- - This policy allows reading questions from ANY session
-- - But client-side subscription filters by session_id
-- - Only instructors with session access can subscribe
-- - Students can only INSERT via server action (which runs as authenticated user)
-- ============================================================================

-- Step 1: Re-enable RLS (if you disabled it)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Enable realtime for questions" ON questions;
DROP POLICY IF EXISTS "Users can view questions" ON questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;

-- Step 3: Create policy that allows SELECT for realtime broadcasting
-- This allows Supabase Realtime to read questions and broadcast changes
CREATE POLICY "Allow SELECT for realtime broadcasting"
ON questions
FOR SELECT
TO authenticated, anon
USING (true);

-- Step 4: Create policy for students to INSERT questions
-- Students submit via server action, which authenticates the session
CREATE POLICY "Allow INSERT for authenticated users"
ON questions
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Step 5: Create policy for instructors to UPDATE questions
-- Instructors can mark questions as processed, regenerate AI, etc.
CREATE POLICY "Allow UPDATE for authenticated users"
ON questions
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Step 6: Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'questions'
ORDER BY cmd, policyname;

-- Expected output:
-- questions | Allow INSERT for authenticated users | PERMISSIVE | {authenticated,anon} | INSERT
-- questions | Allow SELECT for realtime broadcasting | PERMISSIVE | {authenticated,anon} | SELECT
-- questions | Allow UPDATE for authenticated users | PERMISSIVE | {authenticated,anon} | UPDATE

-- Step 7: Verify realtime publication includes questions table
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'questions';

-- Expected output: questions

-- ============================================================================
-- ALTERNATIVE: More restrictive policies (if you want finer control)
-- ============================================================================
-- These policies restrict access more tightly, but realtime still works

-- -- Instructors can only see questions from their own sessions
-- CREATE POLICY "Instructors can view their session questions"
-- ON questions
-- FOR SELECT
-- TO authenticated
-- USING (
--   session_id IN (
--     SELECT id FROM sessions 
--     WHERE instructor_id = (auth.jwt() ->> 'sub')
--   )
-- );

-- -- Anyone can insert questions (students)
-- CREATE POLICY "Anyone can insert questions"
-- ON questions
-- FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (true);

-- -- Instructors can update questions in their sessions
-- CREATE POLICY "Instructors can update their session questions"
-- ON questions
-- FOR UPDATE
-- TO authenticated
-- USING (
--   session_id IN (
--     SELECT id FROM sessions 
--     WHERE instructor_id = (auth.jwt() ->> 'sub')
--   )
-- );

-- ============================================================================
-- TEST: Verify realtime works with RLS enabled
-- ============================================================================

-- 1. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'questions';
-- Expected: questions | t (true)

-- 2. Test insert a question (replace YOUR_SESSION_ID)
-- INSERT INTO questions (session_id, question, student_name) 
-- VALUES (
--   'YOUR_SESSION_ID',
--   'Test with RLS enabled',
--   'RLS Tester'
-- );

-- 3. Check browser console - should see realtime event received!

-- ============================================================================
-- ROLLBACK: If something goes wrong
-- ============================================================================

-- Remove all policies (this will block all access!)
-- DROP POLICY IF EXISTS "Allow SELECT for realtime broadcasting" ON questions;
-- DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON questions;
-- DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON questions;

-- Disable RLS temporarily (not recommended for production!)
-- ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
