-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "student_name" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ai_category" TEXT,
    "ai_relevance_score" INTEGER,
    "ai_reason" TEXT,
    "ai_draft_answer" TEXT,
    "is_processed" BOOLEAN DEFAULT false,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "description" TEXT,
    "unique_code" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_questions_ai_category" ON "questions"("ai_category");

-- CreateIndex
CREATE INDEX "idx_questions_created_at" ON "questions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_questions_is_processed" ON "questions"("is_processed");

-- CreateIndex
CREATE INDEX "idx_questions_session_id" ON "questions"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_unique_code_key" ON "sessions"("unique_code");

-- CreateIndex
CREATE INDEX "idx_sessions_instructor_id" ON "sessions"("instructor_id");

-- CreateIndex
CREATE INDEX "idx_sessions_unique_code" ON "sessions"("unique_code");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

