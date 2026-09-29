'use client'

/**
 * Realtime Test Component
 * 
 * Add this to your session page temporarily to test realtime
 * 
 * Usage:
 * import { RealtimeTest } from '@/components/RealtimeTest'
 * 
 * <RealtimeTest sessionId={session.id} />
 */

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseRealtimeClient'
import { Button } from '@/components/ui/button'

interface RealtimeTestProps {
    sessionId: string
}

export function RealtimeTest({ sessionId }: RealtimeTestProps) {
    const [events, setEvents] = useState<string[]>([])
    const [status, setStatus] = useState<string>('Not subscribed')

    useEffect(() => {
        const supabase = getSupabaseClient()

        console.log('🧪 [Realtime Test] Starting subscription test')

        const channel = supabase
            .channel(`test_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'questions',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    console.log('🧪 [Realtime Test] Event received:', payload)
                    const timestamp = new Date().toLocaleTimeString()
                    setEvents(prev => [
                        `${timestamp} - ${payload.eventType}: ${JSON.stringify(payload.new || payload.old).substring(0, 100)}`,
                        ...prev.slice(0, 9) // Keep last 10 events
                    ])
                }
            )
            .subscribe((status, err) => {
                console.log('🧪 [Realtime Test] Status:', status, err)
                setStatus(status)
                if (err) {
                    console.error('🧪 [Realtime Test] Error:', err)
                }
            })

        return () => {
            console.log('🧪 [Realtime Test] Unsubscribing')
            channel.unsubscribe()
        }
    }, [sessionId])

    const testInsert = async () => {
        try {
            const response = await fetch('/api/test-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    question: `Test question at ${new Date().toISOString()}`,
                    studentName: 'Realtime Tester'
                })
            })

            if (response.ok) {
                console.log('🧪 [Realtime Test] Test question inserted')
            } else {
                console.error('🧪 [Realtime Test] Failed to insert:', await response.text())
            }
        } catch (error) {
            console.error('🧪 [Realtime Test] Error:', error)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-xl max-w-md z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">🧪 Realtime Test</h3>
                <span className={`text-xs px-2 py-1 rounded ${status === 'SUBSCRIBED' ? 'bg-green-100 text-green-700' :
                        status === 'CLOSED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {status}
                </span>
            </div>

            <div className="space-y-2 mb-3">
                <p className="text-sm text-gray-600">
                    Session ID: <code className="text-xs bg-gray-100 px-1 rounded">{sessionId.substring(0, 8)}...</code>
                </p>

                <div className="text-xs">
                    <strong>Events received: {events.length}</strong>
                    <div className="mt-1 max-h-32 overflow-y-auto bg-gray-50 rounded p-2 font-mono text-xs">
                        {events.length === 0 ? (
                            <p className="text-gray-400">No events yet...</p>
                        ) : (
                            events.map((event, i) => (
                                <div key={i} className="mb-1 text-gray-700">
                                    {event}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Button
                    onClick={testInsert}
                    size="sm"
                    className="w-full"
                    disabled={status !== 'SUBSCRIBED'}
                >
                    Insert Test Question
                </Button>

                <p className="text-xs text-gray-500">
                    Open another tab and submit a question to test realtime.
                </p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                <strong>Troubleshooting:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Status should be "SUBSCRIBED"</li>
                    <li>Submit a question from /ask/[code]</li>
                    <li>Event should appear above instantly</li>
                    <li>If no events: Check Supabase Dashboard → Database → Replication</li>
                </ul>
            </div>
        </div>
    )
}
