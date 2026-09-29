"use client";

import { createClient } from "@supabase/supabase-js";
import type { QuestionInterface } from "@/actions/question";

/**
 * Supabase Client for Browser (Realtime)
 *
 * This client is used for:
 * - Realtime subscriptions to database changes
 * - Client-side queries (if needed)
 *
 * Uses anonymous key (safe for browser)
 */

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10, // Rate limit for realtime events
        },
      },
    });
  }

  return supabaseClient;
}

/**
 * Subscribe to new questions for a session
 *
 * @param sessionId - The UUID of the session
 * @param onNewQuestion - Callback when new question is inserted
 * @param onQuestionUpdate - Callback when question is updated
 * @returns Unsubscribe function
 */
export function subscribeToSessionQuestions(
  sessionId: string,
  onNewQuestion: (question: QuestionInterface) => void,
  onQuestionUpdate: (question: QuestionInterface) => void
): () => void {
  const supabase = getSupabaseClient();

  console.log(
    "[Supabase Realtime] Subscribing to session questions:",
    sessionId
  );
  console.log("[Supabase Realtime] Filter:", `session_id=eq.${sessionId}`);

  const channel = supabase
    .channel(`session_${sessionId}_questions`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "questions",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        console.log("[Supabase Realtime] ✅ INSERT event received:", payload);
        onNewQuestion(payload.new as QuestionInterface);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "questions",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        console.log("[Supabase Realtime] ✅ UPDATE event received:", payload);
        onQuestionUpdate(payload.new as QuestionInterface);
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error("[Supabase Realtime] ❌ Subscription error:", err);
      }
      console.log("[Supabase Realtime] Subscription status:", status);

      if (status === "SUBSCRIBED") {
        console.log(
          "[Supabase Realtime] ✅ Successfully subscribed! Waiting for events..."
        );
      }
    });

  return () => {
    console.log("[Supabase Realtime] Unsubscribing from session questions");
    channel.unsubscribe();
  };
}

/**
 * Subscribe to all question updates (for instructor dashboard)
 *
 * @param sessionId - The UUID of the session
 * @param onUpdate - Callback for any question change
 * @returns Unsubscribe function
 */
export function subscribeToQuestionUpdates(
  sessionId: string,
  onUpdate: (question: QuestionInterface) => void
) {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel(`questions-updates-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "questions",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        console.log("Question change:", payload);
        const question = (payload.new || payload.old) as QuestionInterface;
        onUpdate(question);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
