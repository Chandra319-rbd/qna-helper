'use client'

import { QuestionInterface } from '@/actions/question'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { formatDistanceToNow } from 'date-fns'

/**
 * QuestionHoverCard Component
 * 
 * Shows full question text and AI summary on hover
 * Provides quick preview without clicking
 */

interface QuestionHoverCardProps {
    question: QuestionInterface
    children: React.ReactNode
}

export function QuestionHoverCard({ question, children }: QuestionHoverCardProps) {
    const categoryColors = {
        important: "text-red-600",
        creative: "text-purple-600",
        confused: "text-orange-600",
        basic: "text-gray-600",
    };

    const categoryColor = question.ai_category
        ? categoryColors[question.ai_category.toLowerCase() as keyof typeof categoryColors]
        : "text-gray-600";

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                side="right"
                align="start"
                className="w-96 p-4"
                sideOffset={10}
            >
                {/* Header */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">
                            {question.student_name || "Anonymous"}
                        </span>
                        {question.created_at && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs">
                                    {formatDistanceToNow(new Date(question.created_at), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </>
                        )}
                    </div>
                    {question.ai_category && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${categoryColor}`}>
                                {question.ai_category.toUpperCase()}
                            </span>
                            {question.ai_relevance_score !== null && (
                                <span className="text-xs font-semibold text-blue-600">
                                    Score: {question.ai_relevance_score}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Full Question */}
                <div className="mb-3">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {question.question}
                    </p>
                </div>

                {/* AI Summary */}
                {question.ai_reason && (
                    <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                            🤖 AI Analysis
                        </p>
                        <p className="text-xs text-gray-600 italic">
                            {question.ai_reason}
                        </p>
                        {question.ai_draft_answer && (
                            <p className="text-xs text-gray-500 mt-2">
                                Click to see full AI help →
                            </p>
                        )}
                    </div>
                )}

                {/* Status */}
                {question.is_processed && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs font-medium text-green-600">
                            ✓ Already Addressed
                        </span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
