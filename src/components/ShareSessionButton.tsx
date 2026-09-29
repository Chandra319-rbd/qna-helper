'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * ShareSessionButton Component
 * 
 * WHY THIS COMPONENT?
 * - Easy way for instructors to share session links
 * - Copy to clipboard functionality
 * - Shows the full URL students need to visit
 * - Beautiful popover UI
 * 
 * HOW IT WORKS:
 * 1. User clicks "Share" button
 * 2. Popover opens with the link
 * 3. User can:
 *    - Copy the full URL
 *    - See the session code
 * 4. Link is automatically copied
 * 5. Toast notification confirms
 * 
 * FEATURES:
 * - One-click copy to clipboard
 * - Visual feedback (check icon after copy)
 * - Shows full URL
 * - Responsive design
 */

interface ShareSessionButtonProps {
    sessionCode: string
    sessionTitle: string
}

export function ShareSessionButton({ sessionCode, sessionTitle }: ShareSessionButtonProps) {
    const [copied, setCopied] = useState(false)
    const [open, setOpen] = useState(false)

    // Build the full URL
    // In production, this would be your actual domain
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'
    const shareUrl = `${baseUrl}/ask/${sessionCode}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)

            toast.success('Link copied to clipboard!', {
                description: 'Share this link with your students'
            })

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false)
            }, 2000)

        } catch (error) {
            console.error('Failed to copy:', error)
            toast.error('Failed to copy link', {
                description: 'Please copy the link manually'
            })
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Share Session</h4>
                        <p className="text-xs text-muted-foreground">
                            Share this link with students to let them submit questions
                        </p>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-2">
                        <Label className="text-xs">Session</Label>
                        <p className="text-sm font-medium">{sessionTitle}</p>
                    </div>

                    {/* Session Code */}
                    <div className="space-y-2">
                        <Label className="text-xs">Session Code</Label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                                {sessionCode}
                            </code>
                        </div>
                    </div>

                    {/* Link */}
                    <div className="space-y-2">
                        <Label className="text-xs">Share Link</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="text-xs"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button
                                size="sm"
                                onClick={handleCopy}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 Students don't need to sign in to submit questions
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
