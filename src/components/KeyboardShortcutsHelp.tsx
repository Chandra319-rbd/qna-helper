'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

/**
 * Keyboard Shortcuts Help Modal
 * 
 * Shows all available keyboard shortcuts
 * Triggered by pressing '?'
 */

interface KeyboardShortcutsHelpProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
    const shortcuts = [
        {
            category: 'Navigation',
            items: [
                { keys: ['j'], description: 'Next question' },
                { keys: ['k'], description: 'Previous question' },
                { keys: ['↑'], description: 'Previous question (alternative)' },
                { keys: ['↓'], description: 'Next question (alternative)' },
            ],
        },
        {
            category: 'Actions',
            items: [
                { keys: ['m'], description: 'Mark as addressed / Reopen' },
                { keys: ['Enter'], description: 'Generate AI help' },
                { keys: ['c'], description: 'Copy to clipboard' },
                { keys: ['r'], description: 'Regenerate AI help' },
            ],
        },
        {
            category: 'Filters',
            items: [
                { keys: ['1'], description: 'Show all questions' },
                { keys: ['2'], description: 'Show important' },
                { keys: ['3'], description: 'Show creative' },
                { keys: ['4'], description: 'Show confused' },
                { keys: ['5'], description: 'Show basic' },
                { keys: ['0'], description: 'Show unanalyzed' },
            ],
        },
        {
            category: 'Other',
            items: [
                { keys: ['/'], description: 'Focus search' },
                { keys: ['Esc'], description: 'Clear search / Close dialogs' },
                { keys: ['?'], description: 'Show this help' },
            ],
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">⌨️ Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Navigate and manage questions faster with keyboard shortcuts
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {shortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div
                                        key={item.description}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-gray-600">{item.description}</span>
                                        <div className="flex gap-1">
                                            {item.keys.map((key) => (
                                                <kbd
                                                    key={key}
                                                    className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> Keyboard shortcuts only work when not typing in an input field.
                        Press <kbd className="px-1.5 py-0.5 text-xs bg-white border border-blue-300 rounded">Esc</kbd> to unfocus.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
