'use client'

import { useActionState, useEffect } from 'react'
import { createTask } from '@/actions/tasks'
import type { TaskStatus, Profile, MemberRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  defaultStatus: TaskStatus
  members: { user_id: string; role: MemberRole; profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> }[]
}

export function CreateTaskDialog({ open, onOpenChange, projectId, defaultStatus, members }: CreateTaskDialogProps) {
  const [state, action, pending] = useActionState(createTask, undefined)
  const errors = state && !state.success ? state.errors : undefined

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-1">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="status" value={defaultStatus} />

          {state && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="What needs to be done?" required maxLength={255} autoFocus />
            {errors?.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="description" name="description" placeholder="Add more details…" rows={2} maxLength={2000} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Effort</Label>
              <Select name="effort" defaultValue="medium">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">⚡ Quick</SelectItem>
                  <SelectItem value="medium">🕐 Medium</SelectItem>
                  <SelectItem value="large">🔥 Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" className="h-8 text-xs" />
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select name="assignee_id" defaultValue="">
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profile.full_name ?? m.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Adding…' : 'Add Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
