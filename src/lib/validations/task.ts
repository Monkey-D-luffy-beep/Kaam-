import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { error: 'Task title is required.' })
    .max(255, { error: 'Title must be under 255 characters.' })
    .trim(),
  description: z.string().max(2000, { error: 'Description must be under 2000 characters.' }).trim().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  effort: z.enum(['quick', 'medium', 'large']).default('medium'),
  assignee_id: z.string().uuid({ error: 'Invalid assignee.' }).nullable().optional(),
  due_date: z.string().nullable().optional(),
  project_id: z.string().uuid({ error: 'Invalid project ID.' }),
})

export const UpdateTaskSchema = CreateTaskSchema.omit({ project_id: true }).partial()

export const MoveTaskSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(['todo', 'in_progress', 'done']),
  position: z.number().int().min(0),
})

export const AddCommentSchema = z.object({
  task_id: z.string().uuid({ error: 'Invalid task ID.' }),
  content: z
    .string()
    .min(1, { error: 'Comment cannot be empty.' })
    .max(1000, { error: 'Comment must be under 1000 characters.' })
    .trim(),
})

export const ApprovalSchema = z.object({
  task_id: z.string().uuid(),
  action: z.enum(['request', 'approve', 'reject']),
  note: z.string().max(500).trim().optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type MoveTaskInput = z.infer<typeof MoveTaskSchema>
export type AddCommentInput = z.infer<typeof AddCommentSchema>
export type ApprovalInput = z.infer<typeof ApprovalSchema>
