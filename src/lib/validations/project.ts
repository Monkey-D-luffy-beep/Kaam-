import { z } from 'zod'
import { PROJECT_COLORS } from '@/lib/constants'

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Project name is required.' })
    .max(80, { error: 'Project name must be under 80 characters.' })
    .trim(),
  description: z.string().max(500, { error: 'Description must be under 500 characters.' }).trim().optional(),
  color: z.enum([...PROJECT_COLORS] as [string, ...string[]], {
    error: 'Please select a valid color.',
  }).default(PROJECT_COLORS[0]),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export const ArchiveProjectSchema = z.object({
  project_id: z.string().uuid({ error: 'Invalid project ID.' }),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
