'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { createSession } from '@/actions/sessions'
import { toast } from 'sonner'

/**
 * CreateSessionDialog Component
 * 
 * WHY A DIALOG?
 * - Quick action: Creating a session is fast (3-4 fields)
 * - Better UX: User stays on same page, sees context
 * - Modern pattern: Used by Linear, Notion, etc.
 * 
 * HOW IT WORKS:
 * 1. User clicks "New Session" button
 * 2. Dialog opens with form
 * 3. User fills form and submits
 * 4. Client component calls createSession() server action
 * 5. Server creates session in database
 * 6. router.refresh() fetches updated data
 * 7. Dialog closes, new session appears in list!
 */

interface CreateSessionDialogProps {
    trigger?: React.ReactNode // Optional custom trigger button
}

export function CreateSessionDialog({ trigger }: CreateSessionDialogProps) {
    const router = useRouter()

    // State for form fields
    const [title, setTitle] = useState('')
    const [topic, setTopic] = useState('')
    const [description, setDescription] = useState('')

    // State for UI feedback
    const [isCreating, setIsCreating] = useState(false)
    const [open, setOpen] = useState(false)

    // Generate a random unique code for the session
    // This code students will use to join the session
    const generateUniqueCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault() // Prevent page reload

        // Basic validation
        if (!title.trim()) {
            toast.error('Please enter a session title')
            return
        }

        try {
            setIsCreating(true)

            // Call server action to create session
            const newSession = await createSession({
                title: title.trim(),
                topic: topic.trim() || null,
                description: description.trim() || null,
                unique_code: generateUniqueCode(),
                is_active: true, // New sessions are active by default
            })

            // Success! Show success toast
            toast.success('Session created successfully!', {
                description: `Session code: ${newSession.unique_code}`
            })

            // Reset form and close dialog
            setTitle('')
            setTopic('')
            setDescription('')
            setOpen(false)

            // Refresh the page to show new session
            router.refresh()

        } catch (error) {
            console.error('Failed to create session:', error)
            toast.error('Failed to create session', {
                description: 'Please try again or contact support if the problem persists.'
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger button - what user clicks to open dialog */}
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                    </Button>
                )}
            </DialogTrigger>

            {/* The actual dialog content */}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Session</DialogTitle>
                    <DialogDescription>
                        Create a new Q&A session for your students. A unique code will be generated automatically.
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title field (required) */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Session Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Introduction to React Hooks"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isCreating}
                            required
                        />
                    </div>

                    {/* Topic field (optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic (Optional)</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., React, Web Development"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>

                    {/* Description field (optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Add any additional details about this session..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isCreating}
                            rows={3}
                        />
                    </div>

                    {/* Footer with buttons */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Session'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
