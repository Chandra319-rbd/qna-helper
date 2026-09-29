import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Not Found Page for Ask Route
 * 
 * Shown when:
 * - Session code doesn't exist
 * - Session was deleted
 * - Invalid URL
 */

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>

                <h2 className="text-3xl font-bold text-gray-900">
                    Session Not Found
                </h2>

                <p className="text-gray-600 text-lg">
                    The Q&A session you're looking for doesn't exist or has been removed.
                </p>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        Please check:
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                        <li>✓ The session code is correct</li>
                        <li>✓ The link was copied completely</li>
                        <li>✓ The session is still active</li>
                    </ul>
                </div>

                <Button asChild>
                    <Link href="/">
                        Go to Homepage
                    </Link>
                </Button>
            </div>
        </div>
    )
}
