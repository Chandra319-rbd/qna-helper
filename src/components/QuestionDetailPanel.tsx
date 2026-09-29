"use client";

import { QuestionInterface } from "@/actions/question";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Clock,
  Copy,
  RefreshCw,
  CheckCircle2,
  Circle,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";

/**
 * QuestionDetailPanel Component
 *
 * Shows full question details with AI talking points
 * Reference material for instructor to answer questions
 *
 * FEATURES:
 * - Full question text
 * - AI analysis and category
 * - Structured talking points
 * - Code examples with syntax highlighting
 * - Common pitfalls
 * - Action buttons: Copy, Regenerate, Mark Addressed
 */

interface QuestionDetailPanelProps {
  question: QuestionInterface;
  onRegenerate: (questionId: string) => void;
  onMarkAddressed: (questionId: string, addressed: boolean) => void;
}

export function QuestionDetailPanel({
  question,
  onRegenerate,
  onMarkAddressed,
}: QuestionDetailPanelProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [instructorNotes, setInstructorNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Load instructor notes for current question
  useEffect(() => {
    // TODO: Load from database or localStorage
    const savedNotes = localStorage.getItem(`instructor-notes-${question.id}`);
    setInstructorNotes(savedNotes || "");
  }, [question.id]);

  // Auto-save notes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (instructorNotes !== "") {
        saveNotes();
      }
    }, 1000); // Save 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [instructorNotes]);

  const saveNotes = async () => {
    setIsSavingNotes(true);
    try {
      // TODO: Save to database
      localStorage.setItem(`instructor-notes-${question.id}`, instructorNotes);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const categoryColors = {
    important: "bg-red-100 text-red-700 border-red-200",
    creative: "bg-purple-100 text-purple-700 border-purple-200",
    confused: "bg-orange-100 text-orange-700 border-orange-200",
    basic: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const handleCopyAll = () => {
    const content = `
QUESTION: ${question.question}
FROM: ${question.student_name || "Anonymous"}
CATEGORY: ${question.ai_category?.toUpperCase() || "N/A"}
SCORE: ${question.ai_relevance_score || "N/A"}

${question.ai_draft_answer || "No AI draft available"}
        `.trim();

    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate(question.id);
    setIsRegenerating(false);
  };

  const handleToggleAddressed = async () => {
    setIsUpdating(true);
    onMarkAddressed(question.id, !question.is_processed);
    setIsUpdating(false);
    toast.success(
      question.is_processed ? "Marked as unaddressed" : "Marked as addressed!"
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">
                {question.student_name || "Anonymous"}
              </span>
            </div>
            {question.created_at && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(question.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </>
            )}
            {question.ai_relevance_score !== null && (
              <>
                <span className="text-gray-400">•</span>
                <span className="font-semibold text-blue-600">
                  Score: {question.ai_relevance_score}
                </span>
              </>
            )}
          </div>

          {/* Category Badge */}
          {question.ai_category && (
            <div className="mb-4">
              <Badge
                variant="outline"
                className={`text-sm px-3 py-1 border ${
                  categoryColors[
                    question.ai_category.toLowerCase() as keyof typeof categoryColors
                  ] || "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {question.ai_category.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            ❓ Question
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
              {question.question}
            </p>
          </div>
        </div>

        {/* Instructor Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Private Notes
              {isSavingNotes && (
                <span className="text-xs text-gray-500 normal-case font-normal">
                  Saving...
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-500">Only you can see this</span>
          </div>
          <div className="relative">
            <Textarea
              value={instructorNotes}
              onChange={(e) => setInstructorNotes(e.target.value)}
              placeholder="Add your personal notes here...&#10;• Points to remember during explanation&#10;• Follow-up topics&#10;• Related questions to address"
              className="min-h-[100px] text-sm bg-purple-50 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Auto-saves
            </div>
          </div>
        </div>

        {/* Quick Answer Templates */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            ⚡ Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n📖 Refer to slides X-Y`
                    : "📖 Refer to slides X-Y"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              📖 Refer to Slides
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n💻 Will demonstrate live in code`
                    : "💻 Will demonstrate live in code"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              💻 Live Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n🔗 Share docs: [URL]`
                    : "🔗 Share docs: [URL]"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              🔗 Share Docs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n⏰ Follow up: [topic/reason]`
                    : "⏰ Follow up: [topic/reason]"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              ⏰ Follow Up Later
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n💡 Related to: [other question/topic]`
                    : "💡 Related to: [other question/topic]"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              💡 Link Related Topic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInstructorNotes((prev) =>
                  prev
                    ? `${prev}\n\n✍️ Exercise: [description]`
                    : "✍️ Exercise: [description]"
                );
                toast.success("Template added to notes");
              }}
              className="text-xs"
            >
              ✍️ Create Exercise
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to add templates to your notes above
          </p>
        </div>

        {/* AI Analysis & Talking Points */}
        {question.ai_draft_answer ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Talking Points & Help
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="h-8 text-xs"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="h-8 text-xs"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-1 ${
                      isRegenerating ? "animate-spin" : ""
                    }`}
                  />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* AI Reason */}
            {question.ai_reason && (
              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                  Why This Matters
                </p>
                <p className="text-sm text-gray-700 italic">
                  {question.ai_reason}
                </p>
              </div>
            )}

            {/* Draft Answer - Formatted */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                  {question.ai_draft_answer}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Sparkles className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                No AI Help Generated Yet
              </h3>
              <p className="text-xs text-yellow-700 mb-4">
                Generate AI talking points to help answer this question
              </p>
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Help
              </Button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 mt-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleToggleAddressed}
              disabled={isUpdating}
              variant={question.is_processed ? "default" : "outline"}
              size="lg"
              className="flex-1"
            >
              {question.is_processed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Addressed
                </>
              ) : (
                <>
                  <Circle className="h-5 w-5 mr-2" />
                  Mark as Addressed
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            {question.is_processed
              ? "This question has been addressed"
              : "Mark as addressed after you've answered it during the session"}
          </p>
        </div>
      </div>
    </div>
  );
}
