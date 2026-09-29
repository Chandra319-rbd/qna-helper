'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuestionInterface } from '@/actions/question'
import { QuestionsSidebar } from './QuestionsSidebar'
import { QuestionDetailPanel } from './QuestionDetailPanel'
import { BulkGenerationView } from './BulkGenerationView'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { toast } from 'sonner'
import {
    updateQuestionStatus,
    regenerateDraftAnswer,
} from '@/actions/question'
import { subscribeToSessionQuestions } from '@/lib/supabaseRealtimeClient'
import { Bell } from 'lucide-react'

/**
 * SessionQuestionsLayout Component
 * 
 * Main layout for session questions page
 * Manages state for sidebar, detail panel, and bulk view
 * 
 * LAYOUT:
 * [Sidebar (350px fixed)] [Detail Panel (flexible)]
 * 
 * MODES:
 * - Single View: One question in detail panel
 * - Bulk View: Multiple questions in accordion
 * 
 * FEATURES:
 * - Keyboard navigation (j/k, arrows)
 * - Quick actions (m, Enter, c, r)
 * - Filter shortcuts (1-5, 0)
 * - Help modal (?)
 */

interface SessionQuestionsLayoutProps {
    questions: QuestionInterface[]
    sessionId: string
    usageRemainingUnits?: number
    unitsPerQuestion?: number
}

type CategoryFilter = "all" | "important" | "creative" | "confused" | "basic" | "unprocessed";

export function SessionQuestionsLayout({
    questions: initialQuestions,
    sessionId,
    usageRemainingUnits = 0,
    unitsPerQuestion = 2,
}: SessionQuestionsLayoutProps) {
    // Local state for optimistic updates
    const [questions, setQuestions] = useState<QuestionInterface[]>(initialQuestions);

    // Auto-select first unaddressed important question on load
    const getInitialQuestion = () => {
        const firstImportant = questions.find(
            q => !q.is_processed && q.ai_category?.toLowerCase() === 'important'
        );
        return firstImportant?.id || questions[0]?.id || null;
    };

    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(getInitialQuestion());
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkQuestions, setBulkQuestions] = useState<QuestionInterface[]>([]);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    // Get filtered questions based on active filter
    const filteredQuestions = questions.filter(q => {
        if (activeFilter === "all") return true;
        if (activeFilter === "unprocessed") return !q.is_processed || !q.ai_category;
        return q.ai_category?.toLowerCase() === activeFilter;
    });

    const handleSelectQuestion = (id: string) => {
        setSelectedQuestionId(id);
        setBulkMode(false);
    };

    const handleBulkGenerate = (questionIds: string[]) => {
        const selected = questions.filter(q => questionIds.includes(q.id));
        setBulkQuestions(selected);
        setBulkMode(true);
    };

    const handleRegenerate = useCallback(async (questionId: string) => {
        // Optimistic UI: Show loading state
        const toastId = toast.loading('Regenerating AI help...');

        try {
            // Call server action to regenerate AI help
            const updatedQuestion = await regenerateDraftAnswer(questionId);

            // Update local state with server response
            setQuestions(prev =>
                prev.map(q =>
                    q.id === questionId ? updatedQuestion : q
                )
            );

            toast.success('AI help regenerated!', { id: toastId });
        } catch (error) {
            toast.error('Failed to regenerate AI help', { id: toastId });
            console.error('Regenerate error:', error);
        }
    }, []);

    const handleMarkAddressed = useCallback(async (questionId: string, addressed: boolean) => {
        // Optimistic UI: Update immediately
        const previousQuestions = [...questions];

        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        is_processed: addressed,
                        processed_at: addressed ? new Date() : null,
                    }
                    : q
            )
        );

        toast.success(addressed ? 'Marked as addressed!' : 'Reopened question');

        try {
            // Call server action to update question status
            await updateQuestionStatus(questionId, addressed);
        } catch (error) {
            // Rollback on error
            setQuestions(previousQuestions);
            toast.error('Failed to update question status', {
                action: {
                    label: 'Retry',
                    onClick: () => handleMarkAddressed(questionId, addressed),
                },
            });
            console.error('Mark addressed error:', error);
        }
    }, []);

    // Keyboard Navigation
    const moveToNext = useCallback(() => {
        if (bulkMode) return;
        const currentIndex = filteredQuestions.findIndex(q => q.id === selectedQuestionId);
        if (currentIndex < filteredQuestions.length - 1) {
            setSelectedQuestionId(filteredQuestions[currentIndex + 1].id);
        }
    }, [selectedQuestionId, filteredQuestions, bulkMode]);

    const moveToPrevious = useCallback(() => {
        if (bulkMode) return;
        const currentIndex = filteredQuestions.findIndex(q => q.id === selectedQuestionId);
        if (currentIndex > 0) {
            setSelectedQuestionId(filteredQuestions[currentIndex - 1].id);
        }
    }, [selectedQuestionId, filteredQuestions, bulkMode]);

    const handleCopy = useCallback(() => {
        if (!selectedQuestion || bulkMode) return;
        const content = `
QUESTION: ${selectedQuestion.question}
FROM: ${selectedQuestion.student_name || "Anonymous"}
CATEGORY: ${selectedQuestion.ai_category?.toUpperCase() || "N/A"}
SCORE: ${selectedQuestion.ai_relevance_score || "N/A"}

${selectedQuestion.ai_draft_answer || "No AI draft available"}
        `.trim();
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
    }, [selectedQuestion, bulkMode]);

    const handleGenerate = useCallback(() => {
        if (!selectedQuestion || bulkMode) return;
        handleRegenerate(selectedQuestion.id);
    }, [selectedQuestion, bulkMode, handleRegenerate]);

    const handleToggleAddressed = useCallback(() => {
        if (!selectedQuestion || bulkMode) return;
        handleMarkAddressed(selectedQuestion.id, !selectedQuestion.is_processed);
    }, [selectedQuestion, bulkMode, handleMarkAddressed]);

    const handleFilterShortcut = useCallback((filter: CategoryFilter) => {
        setActiveFilter(filter);
        setBulkMode(false);
        // Select first question in new filter
        const filtered = questions.filter(q => {
            if (filter === "all") return true;
            if (filter === "unprocessed") return !q.is_processed || !q.ai_category;
            return q.ai_category?.toLowerCase() === filter;
        });
        if (filtered.length > 0) {
            setSelectedQuestionId(filtered[0].id);
        }
    }, [questions]);

    // Keyboard event handler
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Show help
            if (e.key === '?') {
                e.preventDefault();
                setShowKeyboardHelp(true);
                return;
            }

            // Close help on Escape
            if (e.key === 'Escape') {
                setShowKeyboardHelp(false);
                return;
            }

            // Navigation
            if (e.key === 'j' || e.key === 'ArrowDown') {
                e.preventDefault();
                moveToNext();
                return;
            }

            if (e.key === 'k' || e.key === 'ArrowUp') {
                e.preventDefault();
                moveToPrevious();
                return;
            }

            // Actions
            if (e.key === 'm') {
                e.preventDefault();
                handleToggleAddressed();
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
                return;
            }

            if (e.key === 'c') {
                e.preventDefault();
                handleCopy();
                return;
            }

            if (e.key === 'r') {
                e.preventDefault();
                if (selectedQuestion) {
                    handleRegenerate(selectedQuestion.id);
                }
                return;
            }

            // Filter shortcuts
            if (e.key === '1') {
                e.preventDefault();
                handleFilterShortcut('all');
                return;
            }
            if (e.key === '2') {
                e.preventDefault();
                handleFilterShortcut('important');
                return;
            }
            if (e.key === '3') {
                e.preventDefault();
                handleFilterShortcut('creative');
                return;
            }
            if (e.key === '4') {
                e.preventDefault();
                handleFilterShortcut('confused');
                return;
            }
            if (e.key === '5') {
                e.preventDefault();
                handleFilterShortcut('basic');
                return;
            }
            if (e.key === '0') {
                e.preventDefault();
                handleFilterShortcut('unprocessed');
                return;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        moveToNext,
        moveToPrevious,
        handleToggleAddressed,
        handleGenerate,
        handleCopy,
        handleRegenerate,
        handleFilterShortcut,
        selectedQuestion,
    ]);

    // Realtime Subscription: Listen for new questions and updates
    useEffect(() => {
        console.log('[SessionQuestionsLayout] Setting up realtime subscription for session:', sessionId);

        const unsubscribe = subscribeToSessionQuestions(
            sessionId,
            // onNewQuestion: When a student submits a new question
            (newQuestion) => {
                console.log('[SessionQuestionsLayout] New question received:', newQuestion);
                setQuestions(prev => {
                    console.log('[SessionQuestionsLayout] Adding new question to list. Current count:', prev.length);
                    return [newQuestion, ...prev];
                });

                // Show notification
                toast(
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <div>
                            <p className="font-medium">New Question</p>
                            <p className="text-sm text-muted-foreground">
                                From {newQuestion.student_name || 'Anonymous'}
                            </p>
                        </div>
                    </div>,
                    { duration: 5000 }
                );
            },
            // onQuestionUpdate: When a question is updated (AI analysis, status change, etc.)
            (updatedQuestion) => {
                console.log('[SessionQuestionsLayout] Question updated:', updatedQuestion.id);
                setQuestions(prev =>
                    prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
                );
            }
        );

        return () => {
            console.log('[SessionQuestionsLayout] Cleaning up realtime subscription');
            unsubscribe();
        };
    }, [sessionId]);

    return (
        <>
            <div className="flex h-full relative">
                {/* Left Sidebar */}
                <div className="w-[350px] flex-shrink-0">
                    <QuestionsSidebar
                        questions={questions}
                        selectedQuestionId={selectedQuestionId}
                        onSelectQuestion={handleSelectQuestion}
                        onBulkGenerate={handleBulkGenerate}
                        usageRemainingUnits={usageRemainingUnits}
                        unitsPerQuestion={unitsPerQuestion}
                    />
                </div>

                {/* Right Panel */}
                <div className="flex-1 overflow-hidden">
                    {bulkMode ? (
                        <BulkGenerationView
                            questions={bulkQuestions}
                            onClose={() => setBulkMode(false)}
                        />
                    ) : selectedQuestion ? (
                        <QuestionDetailPanel
                            question={selectedQuestion}
                            onRegenerate={handleRegenerate}
                            onMarkAddressed={handleMarkAddressed}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <p className="text-lg font-medium mb-2">No Question Selected</p>
                                <p className="text-sm">Select a question from the sidebar to view details</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                    <button
                        onClick={() => setShowKeyboardHelp(true)}
                        className="hover:text-blue-300 transition-colors"
                    >
                        Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded mx-1">?</kbd> for keyboard shortcuts
                    </button>
                </div>
            </div>

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsHelp
                open={showKeyboardHelp}
                onOpenChange={setShowKeyboardHelp}
            />
        </>
    );
}
