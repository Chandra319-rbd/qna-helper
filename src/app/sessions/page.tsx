
import { getSessions } from '@/actions/sessions'
import { Card, CardContent } from '@/components/ui/card'
import { SessionCard } from '@/components/SessionCard'
import { DeleteSessionDialog } from '@/components/DeleteSessionDialog'
import { CreateSessionDialog } from '@/components/CreateSessionDialog'

export const metadata = {
    title: 'My Sessions | Q&A Helper Pro',
    description: 'View and manage your Q&A sessions'
}

// This is now a Server Component - no useState, useEffect needed!
export default async function SessionsPage() {
    const sessions = await getSessions()

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage your Q&A sessions
                    </p>
                </div>
                <CreateSessionDialog />
            </div>

            {sessions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                        <p className="text-muted-foreground text-center">
                            No sessions found. Create your first session to get started.
                        </p>
                        <CreateSessionDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            deleteButton={<DeleteSessionDialog sessionId={session.id} />}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Optional: Add loading state
export function SessionsPageSkeleton() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <div className="h-9 w-48 bg-muted animate-pulse rounded" />
                <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
                            <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}