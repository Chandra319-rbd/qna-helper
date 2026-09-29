import { getSessionByUniqueCode } from '@/actions/question'
import { QuestionForm } from '@/components/QuestionForm'
import { notFound } from 'next/navigation'

/**
 * Ask Question Page
 * 
 * PUBLIC PAGE - No authentication required!
 * 
 * ROUTE: /ask/[sessionCode]
 * Example: /ask/ABC123
 * 
 * HOW IT WORKS:
 * 1. Extract sessionCode from URL params
 * 2. Fetch session details from database (Server Component)
 * 3. Check if session exists and is active
 * 4. Render QuestionForm (Client Component) with session data
 * 
 * WHY SERVER COMPONENT?
 * - Fetches data directly from database
 * - Better SEO (session title in HTML)
 * - Validates session before showing form
 * - No loading state needed (Next.js handles it)
 */

interface PageProps {
    params: Promise<{
        sessionCode: string
    }>
}

export default async function AskQuestionPage({ params }: PageProps) {
    const { sessionCode } = await params

    // Fetch session from database (runs on server)
    let session
    try {
        session = await getSessionByUniqueCode(sessionCode)
    } catch (error) {
        // Session not found - show 404 page
        notFound()
    }

    // Check if session is active
    if (!session.is_active) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Session Not Active
                    </h1>
                    <p className="text-gray-600">
                        This Q&A session is currently closed.
                        Please contact your instructor for more information.
                    </p>
                    <p className="text-sm text-gray-500">
                        Session Code: {sessionCode}
                    </p>
                </div>
            </div>
        )
    }

    // Render the question form
    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Ask a Question
                </h1>
                <p className="text-gray-600">
                    Submit your questions for this session
                </p>
            </div>

            <QuestionForm
                sessionCode={session.unique_code}
                sessionTitle={session.title}
                sessionTopic={session.topic}
            />
        </div>
    )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    const { sessionCode } = await params

    try {
        const session = await getSessionByUniqueCode(sessionCode)
        return {
            title: `Ask a Question - ${session.title}`,
            description: `Submit your questions for ${session.title}`,
        }
    } catch (error) {
        return {
            title: 'Session Not Found',
            description: 'This Q&A session does not exist',
        }
    }
}
