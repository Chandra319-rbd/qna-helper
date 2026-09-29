import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { getSessionQuestions } from "@/actions/question";
import { Badge } from "@/components/ui/badge";
import { ShareSessionButton } from "@/components/ShareSessionButton";
import { Metadata } from "next";
import { SessionQuestionsLayout } from "@/components/SessionQuestionsLayout";
import { getUsedUnitsThisMonth } from "@/actions/aiUsage";

interface SessionDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: SessionDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const session = await prisma.sessions.findUnique({
        where: { id },
    });

    return {
        title: session ? `${session.title} - Session Details` : "Session Not Found",
        description: session?.topic || "View and manage session questions",
    };
}

export default async function SessionDetailPage({
    params,
}: SessionDetailPageProps) {
    const { id } = await params;
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Fetch session
    const session = await prisma.sessions.findUnique({
        where: { id },
    });

    // Check if session exists and user owns it
    if (!session || session.instructor_id !== user.id) {
        redirect("/sessions");
    }

    // Fetch real questions from database
    const questions = await getSessionQuestions(id);

    // Calculate stats
    const analyzedCount = questions.filter(q => q.ai_category && q.is_processed).length;
    const totalCount = questions.length;

    // Get AI usage (Used/Cap/Remaining)
    const { used, cap, remaining } = await getUsedUnitsThisMonth();

    return (
        <div className="flex flex-col h-screen">
            {/* Session Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold">{session.title}</h1>
                                <Badge variant={session.is_active ? "default" : "secondary"}>
                                    {session.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            {session.description && (
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                            )}
                        </div>
                        <ShareSessionButton
                            sessionCode={session.unique_code}
                            sessionTitle={session.title}
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                            Session Code: <span className="font-mono font-semibold">{session.unique_code}</span>
                        </span>
                        <span>•</span>
                        <span>
                            📊 {totalCount} questions • {analyzedCount} with AI help
                        </span>
                        <span>•</span>
                        <span>
                            ⚡ Usage: {used}/{cap} used • {remaining} remaining
                        </span>
                    </div>
                </div>
            </div>

            {/* Split Layout with Questions */}
            <div className="flex-1 overflow-hidden">
                <SessionQuestionsLayout
                    questions={questions}
                    sessionId={id}
                    usageRemainingUnits={remaining}
                    unitsPerQuestion={5}
                />
            </div>
        </div>
    );
}
