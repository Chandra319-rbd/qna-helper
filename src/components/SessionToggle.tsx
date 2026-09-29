'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateSessionStatus } from '@/actions/sessions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * SessionToggle Component
 * 
 * WHY A SEPARATE COMPONENT?
 * - Keeps the toggle logic isolated
 * - Can be reused in other places
 * - Easier to test and maintain
 * 
 * HOW IT WORKS:
 * 1. Shows switch with current status
 * 2. User toggles switch
 * 3. Optimistically updates UI (feels instant)
 * 4. Calls server action to update database
 * 5. If fails, reverts to previous state
 * 6. Shows toast notification
 * 
 * FEATURES:
 * - Optimistic UI updates (instant feedback)
 * - Error handling with rollback
 * - Toast notifications
 * - Disabled state during update
 */

interface SessionToggleProps {
    sessionId: string
    initialIsActive: boolean | null
    sessionTitle: string
}

export function SessionToggle({ sessionId, initialIsActive, sessionTitle }: SessionToggleProps) {
    const router = useRouter()

    // Local state for optimistic updates
    const [isActive, setIsActive] = useState(initialIsActive ?? false)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = async (checked: boolean) => {
        // Store previous state for rollback
        const previousState = isActive

        // Optimistic update - update UI immediately
        setIsActive(checked)

        try {
            setIsUpdating(true)

            // Call server action to update database
            await updateSessionStatus(sessionId, checked)

            // Show success toast
            toast.success(
                checked ? 'Session activated' : 'Session deactivated',
                {
                    description: checked
                        ? 'Students can now submit questions'
                        : 'Students cannot submit new questions'
                }
            )

            // Refresh to show updated data
            router.refresh()

        } catch (error) {
            console.error('Failed to update session status:', error)

            // Rollback to previous state on error
            setIsActive(previousState)

            toast.error('Failed to update session status', {
                description: 'Please try again or check your connection.'
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                id={`session-toggle-${sessionId}`}
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
            />
            <Label
                htmlFor={`session-toggle-${sessionId}`}
                className="text-xs text-muted-foreground cursor-pointer"
            >
                {isActive ? 'Active' : 'Inactive'}
            </Label>
        </div>
    )
}
