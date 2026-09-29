import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/prisma'

export type AIOperationType = 'analyze' | 'draft'
export type AIUsageStatus = 'success' | 'failed'

const DEFAULT_MONTHLY_CAP = 1000

function getMonthlyCap(): number {
	const envCap = process.env.AI_MONTHLY_UNIT_CAP
	const parsed = envCap ? Number(envCap) : NaN
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MONTHLY_CAP
}

function getBillingCycleStart(date = new Date()): Date {
	const d = new Date(date)
	d.setUTCDate(1)
	d.setUTCHours(0, 0, 0, 0)
	return d
}

export async function getUsedUnitsThisMonth(): Promise<{ used: number; cap: number; remaining: number }> {
	const user = await currentUser()
	if (!user) throw new Error('User not authenticated')

	const cycleStart = getBillingCycleStart()
	const [{ used }]: Array<{ used: number }> = await prisma.$queryRaw`
		SELECT COALESCE(SUM(units), 0)::int AS used
		FROM ai_usage
		WHERE instructor_id = ${user.id}
		  AND status = 'success'
		  AND created_at >= ${cycleStart}
	`

	const cap = getMonthlyCap()
	const remaining = Math.max(cap - used, 0)
	return { used, cap, remaining }
}

export async function assertCapacityOrThrow(requestedUnits: number): Promise<void> {
	if (requestedUnits <= 0) return
	const { remaining } = await getUsedUnitsThisMonth()
	if (requestedUnits > remaining) {
		throw new Error('AI usage limit reached for this billing cycle')
	}
}

export interface LogUsageEntry {
	sessionId?: string | null
	questionId?: string | null
	operationType: AIOperationType
	units?: number // defaults to 1
	status?: AIUsageStatus // defaults to 'success'
}

export async function logAiUsage(entries: LogUsageEntry | LogUsageEntry[]): Promise<void> {
	const user = await currentUser()
	if (!user) throw new Error('User not authenticated')
	const values = (Array.isArray(entries) ? entries : [entries]).map((e) => ({
		sessionId: e.sessionId ?? null,
		questionId: e.questionId ?? null,
		operationType: e.operationType,
		units: e.units ?? 1,
		status: e.status ?? 'success' as AIUsageStatus,
	}))

	if (values.length === 0) return

	// Build a VALUES list for bulk insert using parameterization
	// prisma.$executeRaw supports template-tag arrays
	await prisma.$executeRawUnsafe(
		[
			`INSERT INTO ai_usage (instructor_id, session_id, question_id, operation_type, units, status)
			 VALUES `,
			values.map(() => '(?, ?, ?, ?, ?, ?)').join(', '),
		].join(''),
		...values.flatMap((v) => [
			user.id,
			v.sessionId,
			v.questionId,
			v.operationType,
			v.units,
			v.status,
		])
	)
}

export const UNIT_WEIGHTS: Record<AIOperationType, number> = {
	analyze: 0,
	draft: 5,
}

export async function ensureCapacityForOperations(ops: Array<{ type: AIOperationType }>): Promise<void> {
	const requested = ops.reduce((sum, op) => sum + (UNIT_WEIGHTS[op.type] ?? 1), 0)
	await assertCapacityOrThrow(requested)
}

 
