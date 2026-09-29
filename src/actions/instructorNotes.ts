"use server";

import prisma from "@/prisma";
import { revalidatePath } from "next/cache";

/**
 * Instructor Notes Actions
 *
 * Server actions for managing private instructor notes on questions
 *
 * TODO: Add instructor_notes table to Prisma schema:
 *
 * model instructor_notes {
 *   id           String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
 *   question_id  String    @db.Uuid
 *   instructor_id String
 *   notes        String
 *   created_at   DateTime? @default(now()) @db.Timestamptz(6)
 *   updated_at   DateTime? @default(now()) @db.Timestamptz(6)
 *   questions    questions @relation(fields: [question_id], references: [id], onDelete: Cascade)
 *
 *   @@unique([question_id, instructor_id])
 *   @@index([question_id])
 *   @@index([instructor_id])
 * }
 */

export interface InstructorNote {
  id: string;
  question_id: string;
  instructor_id: string;
  notes: string;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Get Instructor Notes for Question
 *
 * @param questionId - The UUID of the question
 * @param instructorId - The ID of the instructor (from Clerk)
 * @returns Instructor notes or null if not found
 */
export async function getInstructorNotes(
  questionId: string,
  instructorId: string
): Promise<string | null> {
  try {
    // TODO: Uncomment when instructor_notes table is added to schema
    /*
    const note = await prisma.instructor_notes.findUnique({
      where: {
        question_id_instructor_id: {
          question_id: questionId,
          instructor_id: instructorId,
        },
      },
    });
    
    return note?.notes || null;
    */

    // Temporary: Use localStorage on client side
    return null;
  } catch (error) {
    console.error("Error fetching instructor notes:", error);
    return null;
  }
}

/**
 * Save Instructor Notes
 *
 * Creates or updates instructor notes for a question
 *
 * @param questionId - The UUID of the question
 * @param instructorId - The ID of the instructor (from Clerk)
 * @param notes - The notes content
 * @returns Updated or created note
 */
export async function saveInstructorNotes(
  questionId: string,
  instructorId: string,
  notes: string
): Promise<void> {
  try {
    // TODO: Uncomment when instructor_notes table is added to schema
    /*
    await prisma.instructor_notes.upsert({
      where: {
        question_id_instructor_id: {
          question_id: questionId,
          instructor_id: instructorId,
        },
      },
      update: {
        notes,
        updated_at: new Date(),
      },
      create: {
        question_id: questionId,
        instructor_id: instructorId,
        notes,
      },
    });

    // Revalidate the session page
    const question = await prisma.questions.findUnique({
      where: { id: questionId },
    });
    
    if (question) {
      revalidatePath(`/sessions/${question.session_id}`);
    }
    */

    // Temporary: Notes are saved in localStorage on client side
    console.log("Saving instructor notes (TODO: implement in database):", {
      questionId,
      instructorId,
      notes,
    });
  } catch (error) {
    console.error("Error saving instructor notes:", error);
    throw new Error("Failed to save instructor notes");
  }
}

/**
 * Delete Instructor Notes
 *
 * @param questionId - The UUID of the question
 * @param instructorId - The ID of the instructor (from Clerk)
 */
export async function deleteInstructorNotes(
  questionId: string,
  instructorId: string
): Promise<void> {
  try {
    // TODO: Uncomment when instructor_notes table is added to schema
    /*
    await prisma.instructor_notes.delete({
      where: {
        question_id_instructor_id: {
          question_id: questionId,
          instructor_id: instructorId,
        },
      },
    });

    // Revalidate the session page
    const question = await prisma.questions.findUnique({
      where: { id: questionId },
    });
    
    if (question) {
      revalidatePath(`/sessions/${question.session_id}`);
    }
    */

    console.log("Deleting instructor notes (TODO: implement in database):", {
      questionId,
      instructorId,
    });
  } catch (error) {
    console.error("Error deleting instructor notes:", error);
    throw new Error("Failed to delete instructor notes");
  }
}
