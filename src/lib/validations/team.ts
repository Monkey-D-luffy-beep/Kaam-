import { z } from 'zod'

export const InviteMemberSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
  project_id: z.string().uuid({ error: 'Invalid project ID.' }),
  role: z.enum(['admin', 'member']).default('member'),
})

export const RemoveMemberSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

export const UpdateMemberRoleSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']),
})

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>
