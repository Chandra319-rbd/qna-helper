'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionToggle } from './SessionToggle'
import { ShareSessionButton } from './ShareSessionButton'

interface SessionCardProps {
    session: {
        id: string
        title: string
        topic: string | null
        description: string | null
        unique_code: string
        is_active: boolean | null
        created_at: Date | null
        updated_at: Date | null
    }
    deleteButton: React.ReactNode
}

export function SessionCard({ session, deleteButton }: SessionCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/sessions/${session.id}`)
    }

    return (
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer" onClick={handleClick}>
            {/* Status Badge - Top Right */}
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${session.is_active
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20'
                    : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                    }`}>
                    {session.is_active ? '● Active' : '○ Inactive'}
                </span>
            </div>

            {/* Header Section */}
            <CardHeader className="pb-4">
                <div className="pr-24">
                    <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {session.title || 'Untitled Session'}
                    </CardTitle>
                    {session.topic && (
                        <CardDescription className="mt-1.5 flex items-center gap-1">
                            <span className="text-xs">📚</span>
                            <span>{session.topic}</span>
                        </CardDescription>
                    )}
                </div>
            </CardHeader>

            {/* Content Section */}
            <CardContent className="space-y-3 pt-0">
                {/* Metadata Bar */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium">Code:</span>
                        <code className="px-2 py-0.5 bg-muted rounded font-mono font-semibold">
                            {session.unique_code}
                        </code>
                    </div>
                    <span className="text-muted-foreground/40">•</span>
                    <div className="flex items-center gap-1.5">
                        <span>📅</span>
                        <span>{session.created_at && new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Actions Section */}
                <div onClick={(e) => e.stopPropagation()}>
                    {/* Toggle and Share Row */}
                    <div className="flex items-center justify-between gap-3">
                        <SessionToggle
                            sessionId={session.id}
                            initialIsActive={session.is_active}
                            sessionTitle={session.title}
                        />
                        <div className="flex items-center gap-2">
                            <ShareSessionButton
                                sessionCode={session.unique_code}
                                sessionTitle={session.title}
                            />
                            {deleteButton}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
