"use server";

import prisma from "@/prisma";
import { revalidatePath } from "next/cache";
import {
  assertCapacityOrThrow,
  logAiUsage,
  UNIT_WEIGHTS,
} from "@/actions/aiUsage";
import {
  analyzeQuestionOnly,
  generateDraftAnswer as generateDraftAnswerAI,
} from "@/lib/aiService";

/**
 * Question Interface
 *
 * Represents a question submitted by a student in a Q&A session
 *
 * FIELDS:
 * - id: Unique identifier (UUID)
 * - session_id: Reference to the session this question belongs to
 * - question: The actual question text
 * - student_name: Name of the student (nullable for anonymous questions)
 * - created_at: When the question was submitted
 * - ai_category: AI-generated category (e.g., "technical", "conceptual")
 * - ai_relevance_score: AI score for relevance (0-100)
 * - ai_reason: AI explanation for the score
 * - ai_draft_answer: AI-generated draft answer
 * - is_processed: Whether instructor has addressed this question
 * - processed_at: When the question was processed/answered
 */
export interface QuestionInterface {
  id: string;
  session_id: string;
  question: string;
  student_name: string | null;
  created_at: Date | null;
  ai_category: string | null;
  ai_relevance_score: number | null;
  ai_reason: string | null;
  ai_draft_answer: string | null;
  is_processed: boolean | null;
  processed_at: Date | null;
}

/**
 * Get Session by Unique Code
 *
 * Used by the public question submission form
 * No authentication required - public endpoint
 */
export async function getSessionByUniqueCode(unique_code: string) {
  const session = await prisma.sessions.findUnique({
    where: { unique_code },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
}

/**
 * Submit Question
 *
 * PUBLIC ACTION - No authentication required
 * Anyone with the session code can submit questions
 *
 * PARAMETERS:
 * - uniqueCode: Session's unique code (e.g., "ABC123")
 * - studentName: Student's name (optional, can be null for anonymous)
 * - questionText: The actual question
 *
 * FLOW:
 * 1. Validate session exists
 * 2. Create question in database
 * 3. Revalidate instructor's session page
 * 4. Return the created question
 *
 *
 */

async function analyzeQuestionUpdate(
  questinID: string,
  questionText: string,
  sessionTopic?: string
) {
  try {
    const analysis = await analyzeQuestionOnly(
      questionText.trim(),
      sessionTopic || undefined
    );

    // Update question with analysis
    await prisma.questions.update({
      where: { id: questinID },
      data: {
        ai_category: analysis.category,
        ai_relevance_score: analysis.relevanceScore,
        ai_reason: analysis.reason,
      },
    });
  } catch (error) {
    console.error("Auto-analysis failed:", error);
    // Continue without failing the question submission
  }
}

export async function submitQuestion(
  uniqueCode: string,
  studentName: string | null,
  questionText: string
): Promise<QuestionInterface> {
  // Validation
  if (!questionText || questionText.trim().length === 0) {
    throw new Error("Question text is required");
  }

  if (questionText.trim().length < 10) {
    throw new Error("Question is too short (minimum 10 characters)");
  }

  if (questionText.length > 1000) {
    throw new Error("Question is too long (maximum 1000 characters)");
  }

  // Get session
  const session = await getSessionByUniqueCode(uniqueCode);

  // Check if session is active
  if (!session.is_active) {
    throw new Error("This session is not accepting questions");
  }

  // Create question
  const newQuestion = await prisma.questions.create({
    data: {
      session_id: session.id,
      student_name: studentName?.trim() || null,
      question: questionText.trim(),
      is_processed: false,
    },
  });

  // Automatically analyze the question (free operation)
  analyzeQuestionUpdate(
    newQuestion.id,
    newQuestion.question,
    session.topic || undefined
  );

  // Revalidate the instructor's session detail page
  // So they see new questions immediately
  revalidatePath(`/sessions/${session.id}`);

  return newQuestion;
}

/**
 * Get Session Questions
 *
 * Retrieves all questions for a specific session
 * Ordered by created_at descending (newest first)
 *
 * @param sessionID - The UUID of the session
 * @returns Array of questions for the session
 */
export async function getSessionQuestions(
  sessionID: string
): Promise<QuestionInterface[]> {
  const questions = await prisma.questions.findMany({
    where: { session_id: sessionID },
    orderBy: { created_at: "desc" },
  });
  return questions;
}

/**
 * Update Question Status
 *
 * Marks a question as processed or unprocessed
 * Updates the processed_at timestamp
 *
 * @param questionId - The UUID of the question
 * @param isProcessed - Whether the question is processed
 */
export async function updateQuestionStatus(
  questionId: string,
  isProcessed: boolean
): Promise<QuestionInterface> {
  const updatedQuestion = await prisma.questions.update({
    where: { id: questionId },
    data: {
      is_processed: isProcessed,
      processed_at: isProcessed ? new Date() : null,
    },
  });

  // Revalidate the session page
  revalidatePath(`/sessions/${updatedQuestion.session_id}`);

  return updatedQuestion;
}

/**
 * Generate AI Help for Question
 *
 * TODO: Integrate with Vercel AI SDK and OpenAI/Anthropic
 * For now, generates placeholder AI analysis
 *
 * @param questionId - The UUID of the question
 * @returns Updated question with AI analysis
 */
export async function generateDraftAnswer(
  questionId: string
): Promise<QuestionInterface> {
  // Hard-cap check: charge only for drafting
  await assertCapacityOrThrow(UNIT_WEIGHTS.draft);

  // Get the question
  const question = await prisma.questions.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Get session info for context
  const session = await prisma.sessions.findUnique({
    where: { id: question.session_id },
  });

  try {
    // Call AI service to generate draft answer only
    const draftAnswer = await generateDraftAnswerAI(
      question.question,
      session?.topic || undefined
    );

    // Update question with draft answer
    const updatedQuestion = await prisma.questions.update({
      where: { id: questionId },
      data: {
        ai_draft_answer: draftAnswer,
      },
    });

    // Log usage for drafting
    await logAiUsage({
      sessionId: updatedQuestion.session_id,
      questionId: updatedQuestion.id,
      operationType: "draft",
      units: UNIT_WEIGHTS.draft,
      status: "success",
    });

    // Revalidate the session page
    revalidatePath(`/sessions/${updatedQuestion.session_id}`);

    return updatedQuestion;
  } catch (error) {
    console.error("AI draft generation failed:", error);

    // Log failed usage attempt
    await logAiUsage({
      sessionId: question.session_id,
      questionId: question.id,
      operationType: "draft",
      units: UNIT_WEIGHTS.draft,
      status: "failed",
    });

    throw new Error("Failed to generate draft answer. Please try again.");
  }
}

/**
 * Regenerate AI Help for Question
 *
 * Regenerates AI analysis for a question
 * Same as generateAIHelp but explicitly for regeneration
 *
 * @param questionId - The UUID of the question
 * @returns Updated question with new AI analysis
 */
export async function regenerateDraftAnswer(
  questionId: string
): Promise<QuestionInterface> {
  // Regenerate draft answer (same as generateDraftAnswer)
  return generateDraftAnswer(questionId);
}

/**
 * Bulk Generate AI Help
 *
 * Generates AI help for multiple questions at once
 * Useful for "Generate All" feature
 *
 * @param questionIds - Array of question UUIDs
 * @returns Array of updated questions
 */
export async function bulkGenerateDraftAnswers(
  questionIds: string[]
): Promise<QuestionInterface[]> {
  // Each question consumes draft units only
  const requestedUnits = questionIds.length * UNIT_WEIGHTS.draft;
  await assertCapacityOrThrow(requestedUnits);

  // Process in parallel; per-item logging happens in generateDraftAnswer
  const updatedQuestions = await Promise.all(
    questionIds.map((id) => generateDraftAnswer(id))
  );
  return updatedQuestions;
}
