'use client'

import { useState } from 'react'
import { QuestionInterface } from '@/actions/question'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Download,
    Sparkles,
    User,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * BulkGenerationView Component
 * 
 * Shows multiple questions with AI help in accordion format
 * Useful for pre-session preparation
 * 
 * FEATURES:
 * - Accordion view of multiple questions
 * - Expand/collapse individual questions
 * - Expand/collapse all
 * - Copy all content
 * - Download as PDF (future)
 * - Session summary and stats
 */

interface BulkGenerationViewProps {
    questions: QuestionInterface[]
    onClose: () => void
}

export function BulkGenerationView({ questions, onClose }: BulkGenerationViewProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([questions[0]?.id]));

    const toggleExpanded = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedIds(new Set(questions.map(q => q.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const handleCopyAll = () => {
        const content = questions.map((q, index) => `
═══════════════════════════════════════════════════════
QUESTION ${index + 1}: ${q.question}
FROM: ${q.student_name || "Anonymous"}
CATEGORY: ${q.ai_category?.toUpperCase() || "N/A"}
SCORE: ${q.ai_relevance_score || "N/A"}
═══════════════════════════════════════════════════════

${q.ai_draft_answer || "No AI draft available"}

        `).join('\n\n');

        navigator.clipboard.writeText(content);
        toast.success("All content copied to clipboard!");
    };

    const categoryColors = {
        important: "bg-red-100 text-red-700 border-red-200",
        creative: "bg-purple-100 text-purple-700 border-purple-200",
        confused: "bg-orange-100 text-orange-700 border-orange-200",
        basic: "bg-gray-100 text-gray-700 border-gray-200",
    };

    // Calculate stats
    const totalEstimatedTime = questions.length * 5; // Rough estimate
    const categoryCounts = questions.reduce((acc, q) => {
        const cat = q.ai_category?.toLowerCase() || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                                Combined Prep Sheet
                            </h2>
                            <p className="text-sm text-gray-600">
                                {questions.length} questions selected for review
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            ← Back to Single View
                        </Button>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">
                            📊 Session Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-blue-600 font-semibold">{questions.length}</p>
                                <p className="text-blue-700 text-xs">Total Questions</p>
                            </div>
                            <div>
                                <p className="text-blue-600 font-semibold">~{totalEstimatedTime} min</p>
                                <p className="text-blue-700 text-xs">Est. Time</p>
                            </div>
                            {Object.entries(categoryCounts).map(([cat, count]) => (
                                <div key={cat}>
                                    <p className="text-blue-600 font-semibold">{count}</p>
                                    <p className="text-blue-700 text-xs capitalize">{cat}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyAll}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info("PDF export coming soon!")}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={expandAll}
                            >
                                Expand All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={collapseAll}
                            >
                                Collapse All
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Questions Accordion */}
                <div className="space-y-4">
                    {questions.map((question, index) => {
                        const isExpanded = expandedIds.has(question.id);

                        return (
                            <div
                                key={question.id}
                                className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleExpanded(question.id)}
                                    className="w-full p-4 flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                Q{index + 1}
                                            </span>
                                            {question.ai_category && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs border ${categoryColors[
                                                        question.ai_category.toLowerCase() as keyof typeof categoryColors
                                                        ] || "bg-gray-100 text-gray-700 border-gray-200"
                                                        }`}
                                                >
                                                    {question.ai_category.toUpperCase()}
                                                </Badge>
                                            )}
                                            {question.ai_relevance_score !== null && (
                                                <span className="text-xs font-semibold text-blue-600">
                                                    Score: {question.ai_relevance_score}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium mb-1">
                                            {question.question}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="h-3 w-3" />
                                            <span>{question.student_name || "Anonymous"}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Accordion Content */}
                                {isExpanded && (
                                    <div className="p-6 bg-white border-t border-gray-200">
                                        {/* AI Reason */}
                                        {question.ai_reason && (
                                            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                                                    Why This Matters
                                                </p>
                                                <p className="text-sm text-gray-700 italic">
                                                    {question.ai_reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Draft Answer */}
                                        {question.ai_draft_answer ? (
                                            <div className="prose prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                                                    {question.ai_draft_answer}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">
                                                No AI draft available for this question
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        💡 Tip: Use this prep sheet before your session to familiarize yourself with the questions
                    </p>
                </div>
            </div>
        </div>
    );
}
