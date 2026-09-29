-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table
-- Changed instructor_id from UUID to TEXT to store Clerk user ID
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  unique_code TEXT UNIQUE NOT NULL,
  instructor_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL CHECK (char_length(question) <= 1000),
  student_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- AI Analysis Fields
  ai_category TEXT CHECK (ai_category IN ('important', 'creative', 'confused', 'basic')),
  ai_relevance_score INTEGER CHECK (ai_relevance_score >= 0 AND ai_relevance_score <= 100),
  ai_reason TEXT,
  ai_draft_answer TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_sessions_unique_code ON sessions(unique_code);
CREATE INDEX idx_sessions_instructor_id ON sessions(instructor_id);
CREATE INDEX idx_questions_session_id ON questions(session_id);
CREATE INDEX idx_questions_is_processed ON questions(is_processed);
CREATE INDEX idx_questions_ai_category ON questions(ai_category);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions table
-- Updated to use Clerk's JWT token (auth.jwt()->>'sub') instead of auth.uid()
CREATE POLICY "Instructors can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    ((SELECT auth.jwt()->>'sub') = instructor_id)
  );

CREATE POLICY "Instructors can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    ((SELECT auth.jwt()->>'sub') = instructor_id)
  );

CREATE POLICY "Instructors can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (
    ((SELECT auth.jwt()->>'sub') = instructor_id)
  );

CREATE POLICY "Instructors can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (
    ((SELECT auth.jwt()->>'sub') = instructor_id)
  );

-- RLS Policies for questions table
CREATE POLICY "Anyone can submit questions"
  ON questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Instructors can view questions for their sessions"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = questions.session_id
      AND ((SELECT auth.jwt()->>'sub') = sessions.instructor_id)
    )
  );

CREATE POLICY "Instructors can update questions for their sessions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = questions.session_id
      AND ((SELECT auth.jwt()->>'sub') = sessions.instructor_id)
    )
  );

CREATE POLICY "Instructors can delete questions for their sessions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = questions.session_id
      AND ((SELECT auth.jwt()->>'sub') = sessions.instructor_id)
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to sessions table
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
