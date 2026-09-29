'use client'

import { useState, useMemo } from 'react'
import { QuestionInterface } from '@/actions/question'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MessageSquare,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { updateQuestionStatus } from '@/actions/question'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

/**
 * QuestionList Component with AI-Focused Filtering
 * 
 * WHY CLIENT COMPONENT?
 * - Interactive filters with state
 * - Expandable question details
 * - Real-time sorting and filtering
 * - Toggle processed status
 * 
 * FEATURES:
 * - Category pills: All, Important, Creative, Confused, Basic, Unprocessed
 * - Sort by: Newest, Oldest, Relevance Score
 * - Expandable AI analysis details
 * - Mark questions as processed
 * - Show counts per category
 */

interface QuestionListProps {
    questions: QuestionInterface[]
    sessionId: string
}

type CategoryFilter =
    | "all"
    | "important"
    | "creative"
    | "confused"
    | "basic"
    | "unprocessed";
type SortOption = "newest" | "oldest" | "relevance";

const categoryLabels = {
    all: "All Questions",
    important: "Important",
    creative: "Creative",
    confused: "Confused",
    basic: "Basic",
    unprocessed: "Not Analyzed",
};

const categoryColors = {
    important: "bg-red-100 text-red-700 border-red-200",
    creative: "bg-purple-100 text-purple-700 border-purple-200",
    confused: "bg-orange-100 text-orange-700 border-orange-200",
    basic: "bg-gray-100 text-gray-700 border-gray-200",
};

export function QuestionList({ questions, sessionId }: QuestionListProps) {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts = {
            all: questions.length,
            important: 0,
            creative: 0,
            confused: 0,
            basic: 0,
            unprocessed: 0,
        };

        questions.forEach((q) => {
            if (!q.is_processed || !q.ai_category) {
                counts.unprocessed++;
            } else if (q.ai_category) {
                const category = q.ai_category.toLowerCase() as keyof typeof counts;
                if (category in counts) {
                    counts[category]++;
                }
            }
        });

        return counts;
    }, [questions]);

    // Filter questions
    const filteredQuestions = useMemo(() => {
        if (selectedCategory === "all") return questions;
        if (selectedCategory === "unprocessed") {
            return questions.filter((q) => !q.is_processed || !q.ai_category);
        }
        return questions.filter(
            (q) => q.ai_category?.toLowerCase() === selectedCategory
        );
    }, [questions, selectedCategory]);

    // Sort questions
    const sortedQuestions = useMemo(() => {
        const sorted = [...filteredQuestions];

        if (sortBy === "newest") {
            sorted.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });
        } else if (sortBy === "oldest") {
            sorted.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB;
            });
        } else if (sortBy === "relevance") {
            sorted.sort((a, b) => {
                const scoreA = a.ai_relevance_score ?? -1;
                const scoreB = b.ai_relevance_score ?? -1;
                return scoreB - scoreA;
            });
        }

        return sorted;
    }, [filteredQuestions, sortBy]);

    const toggleExpanded = (questionId: string) => {
        setExpandedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    const handleToggleProcessed = async (questionId: string, currentStatus: boolean | null) => {
        try {
            await updateQuestionStatus(questionId, !currentStatus)
            toast.success(
                currentStatus ? 'Marked as unprocessed' : 'Marked as processed'
            )
            router.refresh()
        } catch (error) {
            console.error('Failed to update question:', error)
            toast.error('Failed to update question status')
        }
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No questions yet
                </h3>
                <p className="text-gray-600">
                    Questions submitted by students will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(categoryLabels) as CategoryFilter[]).map((category) => {
                        const count = categoryCounts[category];
                        const isActive = selectedCategory === category;

                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {categoryLabels[category]}
                                <span
                                    className={`ml-1.5 ${isActive ? "text-blue-100" : "text-gray-500"
                                        }`}
                                >
                                    ({count})
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="relevance">Relevance Score</option>
                    </select>
                </div>
            </div>

            {/* Questions List */}
            {sortedQuestions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No questions in this category</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedQuestions.map((question) => {
                        const isExpanded = expandedQuestions.has(question.id);

                        return (
                            <div
                                key={question.id}
                                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">
                                            {question.student_name || "Anonymous"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {question.is_processed &&
                                            question.ai_relevance_score !== null && (
                                                <span className="text-xs font-semibold text-blue-600 px-2 py-1 bg-blue-50 rounded">
                                                    Score: {question.ai_relevance_score}
                                                </span>
                                            )}
                                        {question.created_at && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDistanceToNow(new Date(question.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div className="pl-6">
                                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                        {question.question}
                                    </p>
                                </div>

                                {/* AI Analysis */}
                                {question.is_processed && question.ai_category && (
                                    <div className="mt-4 pl-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                                    AI Analysis
                                                </span>
                                                {question.ai_category && (
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryColors[
                                                            question.ai_category.toLowerCase() as keyof typeof categoryColors
                                                        ] || "bg-gray-100 text-gray-700 border-gray-200"
                                                            }`}
                                                    >
                                                        {question.ai_category.charAt(0).toUpperCase() +
                                                            question.ai_category.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpanded(question.id)}
                                                className="h-7 text-xs"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="h-3 w-3 mr-1" />
                                                        Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-3 w-3 mr-1" />
                                                        Show Details
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-3 mt-3">
                                                {question.ai_reason && (
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700 mb-1">
                                                            Reason:
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {question.ai_reason}
                                                        </p>
                                                    </div>
                                                )}

                                                {question.ai_draft_answer && (
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700 mb-1">
                                                            Draft Answer:
                                                        </p>
                                                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
                                                            {question.ai_draft_answer}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mark as Processed Button */}
                                <div className="mt-4 pl-6 pt-4 border-t border-gray-100">
                                    <Button
                                        variant={question.is_processed ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleToggleProcessed(question.id, question.is_processed)}
                                        className="min-w-[120px]"
                                    >
                                        {question.is_processed ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Processed
                                            </>
                                        ) : (
                                            <>
                                                <Circle className="h-4 w-4 mr-1" />
                                                Mark as Done
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


