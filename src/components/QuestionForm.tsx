'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { submitQuestion } from '@/actions/question'
import { CheckCircle2 } from 'lucide-react'

/**
 * QuestionForm Component
 * 
 * WHY A CLIENT COMPONENT?
 * - Needs form state (name, question)
 * - Handles user input and submission
 * - Shows loading/success states
 * 
 * HOW IT WORKS:
 * 1. Student enters their name (optional)
 * 2. Student types their question
 * 3. Form validates input
 * 4. Calls server action to submit question
 * 5. Shows success message
 * 6. Allows submitting more questions
 */

interface QuestionFormProps {
    sessionCode: string
    sessionTitle: string
    sessionTopic: string | null
}

export function QuestionForm({ sessionCode, sessionTitle, sessionTopic }: QuestionFormProps) {
    const [studentName, setStudentName] = useState('')
    const [question, setQuestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!question.trim()) {
            toast.error('Please enter your question')
            return
        }

        if (question.trim().length < 10) {
            toast.error('Question is too short', {
                description: 'Please provide more details (at least 10 characters)'
            })
            return
        }

        try {
            setIsSubmitting(true)

            // Submit question via server action
            await submitQuestion(
                sessionCode,
                studentName.trim() || null, // null if empty
                question.trim()
            )

            // Success!
            toast.success('Question submitted successfully!', {
                description: 'Your instructor will answer it soon.'
            })

            // Show success state
            setIsSuccess(true)

            // Reset form after 2 seconds
            setTimeout(() => {
                setQuestion('')
                setIsSuccess(false)
            }, 2000)

        } catch (error) {
            console.error('Failed to submit question:', error)
            toast.error('Failed to submit question', {
                description: 'Please try again or check your connection.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{sessionTitle}</CardTitle>
                <CardDescription>
                    {sessionTopic && <span className="font-medium">{sessionTopic} • </span>}
                    Ask your questions here. They'll be visible to your instructor.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSuccess ? (
                    // Success Message
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Question Submitted!
                            </h3>
                            <p className="text-gray-600">
                                Your instructor will answer it soon.
                            </p>
                        </div>
                    </div>
                ) : (
                    // Question Form
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Student Name (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="studentName">
                                Your Name (Optional)
                            </Label>
                            <Input
                                id="studentName"
                                type="text"
                                placeholder="e.g., John Doe"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                disabled={isSubmitting}
                                maxLength={100}
                            />
                            <p className="text-xs text-gray-500">
                                You can submit anonymously if you prefer
                            </p>
                        </div>

                        {/* Question (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="question">
                                Your Question <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="question"
                                placeholder="Ask your question here..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                disabled={isSubmitting}
                                rows={6}
                                maxLength={1000}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {question.length}/1000 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting || !question.trim()}
                            className="w-full"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Question'}
                        </Button>
                    </form>
                )}

                {/* Info Footer */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-900">
                        <span className="font-medium">Session Code:</span> {sessionCode}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        Share this link with others to let them ask questions too!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
