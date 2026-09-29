'use server'

import { currentUser } from '@clerk/nextjs/server'
import prisma from '../prisma'
import { revalidatePath } from 'next/cache'

export interface SessionInterface {
    id: string;
    title: string;
    topic: string | null;
    description: string | null;
    unique_code: string;
    instructor_id: string;
    is_active: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
}


export async function getSessions(){
    const user = await currentUser();
    
    if (!user) {
        throw new Error("User not authenticated");
    }
    
    const sessions  = await prisma.sessions.findMany({
        where: {
            instructor_id: user.id 
        },
        orderBy: {
            created_at: 'desc'
        }
    })

    return sessions;
}


export async function createSession(session: Omit<SessionInterface, 'instructor_id' | 'id' | 'created_at' | 'updated_at'>){
    const user = await currentUser();
    if(!user){
        throw new Error("User not authenticated");
    }
    const newSession = await prisma.sessions.create({
        data: {
            ...session,
            instructor_id: user.id
        }
    })

    // Revalidate the sessions page to show the new session
    revalidatePath('/sessions')

    return newSession;
}

export async function updateSessionStatus(sessionId: string, isActive: boolean){
    const user = await currentUser();
    
    if (!user) {
        throw new Error("User not authenticated");
    }

    // Verify the session belongs to the user before updating
    const session = await prisma.sessions.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.instructor_id !== user.id) {
        throw new Error("Unauthorized to update this session");
    }

    const updatedSession = await prisma.sessions.update({
        where: {
            id: sessionId
        },
        data: {
            is_active: isActive
        }
    })
    
    // Revalidate both the sessions list and the specific session page
    revalidatePath('/sessions')
    revalidatePath(`/sessions/${sessionId}`)
    
    return updatedSession;
}

export async function getSessionById(sessionId: string){
    const session = await prisma.sessions.findUnique({
        where: {
            id: sessionId
        }
    })

    return session;
}

export async function deleteSession(sessionId: string){
    const user = await currentUser();
    
    if (!user) {
        throw new Error("User not authenticated");
    }

    // Verify the session belongs to the user before deleting
    const session = await prisma.sessions.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.instructor_id !== user.id) {
        throw new Error("Unauthorized to delete this session");
    }

    const deletedSession = await prisma.sessions.delete({
        where: {
            id: sessionId
        }
    })

    // Revalidate the sessions page to show updated data
    revalidatePath('/sessions')

    return deletedSession;
}


