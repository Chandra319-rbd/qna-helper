'use client'

import { useState, useMemo } from 'react'
import { QuestionInterface } from '@/actions/question'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    User,
    Search,
    Sparkles,
    CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { QuestionHoverCard } from './QuestionHoverCard'

/**
 * QuestionsSidebar Component
 * 
 * Left sidebar showing filterable list of questions
 * 
 * FEATURES:
 * - Category filter pills with counts
 * - Sort dropdown
 * - Search bar
 * - Question list items with hover preview
 * - Bulk "Generate All" button
 * - Responsive width
 */

interface QuestionsSidebarProps {
    questions: QuestionInterface[]
    selectedQuestionId: string | null
    onSelectQuestion: (id: string) => void
    onBulkGenerate: (questionIds: string[]) => void
    usageRemainingUnits?: number
    unitsPerQuestion?: number
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
    all: "All",
    important: "Important",
    creative: "Creative",
    confused: "Confused",
    basic: "Basic",
    unprocessed: "Unanalyzed",
};

const categoryIcons = {
    important: "🔴",
    creative: "🟣",
    confused: "🟠",
    basic: "⚪",
};

export function QuestionsSidebar({
    questions,
    selectedQuestionId,
    onSelectQuestion,
    onBulkGenerate,
    usageRemainingUnits = 0,
    unitsPerQuestion = 2,
}: QuestionsSidebarProps) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [searchQuery, setSearchQuery] = useState("")

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
            if (!q.ai_category) {
                // Questions without AI category go to unprocessed
                counts.unprocessed++;
            } else {
                // Questions with AI category go to their respective category regardless of processed status
                const category = q.ai_category.toLowerCase() as keyof typeof counts;
                if (category in counts) {
                    counts[category]++;
                }
            }
        });

        return counts;
    }, [questions]);

    // Filter and search questions
    const filteredQuestions = useMemo(() => {
        let filtered = questions;

        // Category filter
        if (selectedCategory === "unprocessed") {
            filtered = filtered.filter((q) => !q.is_processed || !q.ai_category);
        } else if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (q) => q.ai_category?.toLowerCase() === selectedCategory
            );
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (q) =>
                    q.question.toLowerCase().includes(query) ||
                    q.student_name?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [questions, selectedCategory, searchQuery]);

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

    const handleBulkGenerate = () => {
        const maxQuestionsByUnits = Math.floor(usageRemainingUnits / Math.max(unitsPerQuestion, 1));
        const eligible = sortedQuestions.slice(0, Math.max(maxQuestionsByUnits, 0));
        const questionIds = eligible.map(q => q.id);
        onBulkGenerate(questionIds);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold mb-3">Questions</h2>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="p-3 border-b border-gray-200 bg-white">
                <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(categoryLabels) as CategoryFilter[]).map((category) => {
                        const count = categoryCounts[category];
                        const isActive = selectedCategory === category;

                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {categoryLabels[category]}
                                <span
                                    className={`ml-1 ${isActive ? "text-blue-100" : "text-gray-500"
                                        }`}
                                >
                                    ({count})
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sort */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="relevance">Relevance Score</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {sortedQuestions.length > 0 && (
                <div className="p-3 border-b border-gray-200 bg-white">
                    {/* Usage badge */}
                    <div className="flex items-center justify-between mb-2 text-[11px] text-gray-600">
                        <span>
                            ⚡ Remaining units: {usageRemainingUnits}
                        </span>
                        <span>
                            {unitsPerQuestion} units/question
                        </span>
                    </div>
                    <Button
                        onClick={handleBulkGenerate}
                        size="sm"
                        className="w-full h-8 text-xs"
                        variant="outline"
                        disabled={Math.floor(usageRemainingUnits / Math.max(unitsPerQuestion, 1)) <= 0}
                    >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        {Math.floor(usageRemainingUnits / Math.max(unitsPerQuestion, 1)) > 0
                            ? `Generate Up To (${Math.min(sortedQuestions.length, Math.floor(usageRemainingUnits / Math.max(unitsPerQuestion, 1)))})`
                            : 'Out of AI Units'}
                    </Button>
                </div>
            )}

            {/* Question List */}
            <div className="flex-1 overflow-y-auto">
                {sortedQuestions.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        {searchQuery ? "No questions match your search" : "No questions in this category"}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sortedQuestions.map((question) => (
                            <QuestionListItem
                                key={question.id}
                                question={question}
                                isSelected={selectedQuestionId === question.id}
                                onClick={() => onSelectQuestion(question.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-gray-200 bg-white text-xs text-gray-600">
                Showing {sortedQuestions.length} of {questions.length} questions
            </div>
        </div>
    );
}

/**
 * Individual Question List Item
 */
interface QuestionListItemProps {
    question: QuestionInterface
    isSelected: boolean
    onClick: () => void
}

function QuestionListItem({ question, isSelected, onClick }: QuestionListItemProps) {
    const categoryIcon = question.ai_category
        ? categoryIcons[question.ai_category.toLowerCase() as keyof typeof categoryIcons]
        : "⚫";

    const truncatedQuestion = question.question.length > 60
        ? question.question.substring(0, 60) + "..."
        : question.question;

    return (
        <QuestionHoverCard question={question}>
            <button
                onClick={onClick}
                className={`w-full p-3 text-left transition-colors hover:bg-blue-50 ${isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""
                    }`}
            >
                {/* Student Name & Time */}
                <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">
                        {question.student_name || "Anonymous"}
                    </span>
                    {question.created_at && (
                        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                            {formatDistanceToNow(new Date(question.created_at), {
                                addSuffix: false,
                            }).replace('about ', '')}
                        </span>
                    )}
                </div>

                {/* Question Preview */}
                <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                    {truncatedQuestion}
                </p>

                {/* Category & Score */}
                <div className="flex items-center gap-2">
                    {question.ai_category && (
                        <span className="text-xs">
                            {categoryIcon} {question.ai_category}
                        </span>
                    )}
                    {question.ai_relevance_score !== null && (
                        <span className="text-xs font-semibold text-blue-600 ml-auto">
                            {question.ai_relevance_score}
                        </span>
                    )}
                    {question.is_processed && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 ml-auto" />
                    )}
                </div>
            </button>
        </QuestionHoverCard>
    );
}
