'use client'

import { useActionState, useEffect, useTransition } from 'react'
import type { Project, Profile, MemberRole } from '@/types'
import { updateProject } from '@/actions/projects'
import { inviteMember, removeMember } from '@/actions/team'
import { PROJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { UserMinus, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Member {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>
}

interface ProjectSettingsClientProps {
  project: Project
  members: Member[]
  currentUserId: string
  isAdmin: boolean
}

export function ProjectSettingsClient({
  project,
  members,
  currentUserId,
  isAdmin,
}: ProjectSettingsClientProps) {
  const [, startTransition] = useTransition()

  const boundUpdate = updateProject.bind(null, project.id)
  const [updateState, updateAction, updatePending] = useActionState(boundUpdate, undefined)

  const [inviteState, inviteAction, invitePending] = useActionState(inviteMember, undefined)
  const inviteErrors = inviteState && !inviteState.success ? inviteState.errors : undefined

  useEffect(() => {
    if (updateState?.success) toast.success(updateState.message)
    else if (updateState && !updateState.success) toast.error(updateState.message)
  }, [updateState])

  useEffect(() => {
    if (inviteState?.success) toast.success(inviteState.message)
    else if (inviteState && !inviteState.success) toast.error(inviteState.message)
  }, [inviteState])

  async function handleRemove(userId: string) {
    startTransition(async () => {
      const result = await removeMember(project.id, userId)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold mb-4">Project Details</h2>
        <form action={updateAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={project.name} required maxLength={80} disabled={!isAdmin} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={project.description ?? ''} rows={2} maxLength={500} disabled={!isAdmin} />
          </div>
          {isAdmin && (
            <>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <label key={color} className="relative cursor-pointer">
                      <input type="radio" name="color" value={color} defaultChecked={color === project.color} className="peer sr-only" />
                      <span
                        className="flex h-6 w-6 rounded-full peer-checked:scale-125 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-foreground/30 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" size="sm" disabled={updatePending}>
                {updatePending ? 'Saving…' : 'Save Changes'}
              </Button>
            </>
          )}
        </form>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold mb-4">Team Members</h2>
        <div className="space-y-2 mb-6">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={m.profile.avatar_url ?? ''} />
                  <AvatarFallback className="text-xs">
                    {(m.profile.full_name ?? m.profile.email ?? 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.profile.full_name ?? m.profile.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs capitalize">{m.role}</Badge>
                {isAdmin && m.user_id !== currentUserId && m.role !== 'owner' && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        />
                      }
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove {m.profile.full_name ?? m.profile.email} from this project?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(m.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Invite Member</h3>
            <form action={inviteAction} className="space-y-3">
              <input type="hidden" name="project_id" value={project.id} />
              {inviteState && !inviteState.success && (
                <Alert variant="destructive">
                  <AlertDescription>{inviteState.message}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Input name="email" type="email" placeholder="colleague@example.com" required className="flex-1" />
                <Button type="submit" size="sm" disabled={invitePending}>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {invitePending ? 'Sending…' : 'Invite'}
                </Button>
              </div>
              {inviteErrors?.email && (
                <p className="text-xs text-destructive">{inviteErrors.email[0]}</p>
              )}
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
