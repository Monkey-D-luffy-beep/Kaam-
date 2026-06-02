'use client'

import { useActionState, useEffect, useTransition, useState } from 'react'
import { format } from 'date-fns'
import type { TaskWithAssignee, Profile, MemberRole } from '@/types'
import { PRIORITY_CONFIG, STATUS_CONFIG, EFFORT_CONFIG, APPROVAL_CONFIG, ROLE_CONFIG } from '@/lib/constants'
import { updateTask, deleteTask, handleApproval } from '@/actions/tasks'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Save, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { EffortBadge, ApprovalBadge } from '@/components/shared/effort-badge'

interface BoardMember {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

interface TaskDetailSheetProps {
  task: TaskWithAssignee
  projectId: string
  members: BoardMember[]
  currentUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailSheet({ task, projectId, members, currentUserId, open, onOpenChange }: TaskDetailSheetProps) {
  const [, startTransition] = useTransition()
  const [rejectionNote, setRejectionNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const boundUpdate = updateTask.bind(null, task.id, projectId)
  const [state, action, pending] = useActionState(boundUpdate, undefined)

  useEffect(() => {
    if (state?.success) toast.success(state.message)
    else if (state && !state.success) toast.error(state.message)
  }, [state])

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteTask(task.id, projectId)
      if (result.success) { toast.success(result.message); onOpenChange(false) }
      else toast.error(result.message)
    })
  }

  async function onApproval(action: 'request' | 'approve' | 'reject', note?: string) {
    startTransition(async () => {
      const result = await handleApproval(task.id, projectId, action, note)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
      setShowRejectInput(false)
      setRejectionNote('')
    })
  }

  const currentMember = members.find(m => m.user_id === currentUserId)
  const currentRole = (currentMember?.role ?? 'member') as MemberRole
  const canApprove = ROLE_CONFIG[currentRole]?.canApprove ?? false
  const priority = PRIORITY_CONFIG[task.priority]
  const status = STATUS_CONFIG[task.status]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn('text-xs border-0', status.bgColor, status.color)}>{status.label}</Badge>
            <Badge variant="outline" className={cn('text-xs', priority.color)}>{priority.label}</Badge>
            <EffortBadge effort={task.effort} size="xs" />
            <ApprovalBadge status={task.approval_status} size="xs" />
          </div>
          <SheetTitle className="text-left text-base">{task.title}</SheetTitle>
        </SheetHeader>

        {/* Approval controls */}
        {task.approval_status !== 'none' || true ? (
          <div className="mb-4 rounded-lg border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Review</p>
            {task.approval_status === 'none' && (
              <Button size="sm" variant="outline" onClick={() => onApproval('request')} className="w-full">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Request Approval
              </Button>
            )}
            {task.approval_status === 'pending_approval' && (
              <div className="space-y-2">
                <p className="text-xs text-amber-700 font-medium">⏳ Awaiting review</p>
                {canApprove && !showRejectInput && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-green-700 border-green-200" onClick={() => onApproval('approve')}>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-700 border-red-200" onClick={() => setShowRejectInput(true)}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
                {canApprove && showRejectInput && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Reason for rejection (optional)…"
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-red-700" onClick={() => onApproval('reject', rejectionNote)}>
                        Confirm Reject
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
                <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => onApproval('request')}>
                  Cancel request
                </Button>
              </div>
            )}
            {task.approval_status === 'approved' && (
              <div>
                <p className="text-xs text-green-700 font-medium">✓ Approved</p>
                {task.approval_note && <p className="text-xs text-muted-foreground mt-1">"{task.approval_note}"</p>}
                <Button size="sm" variant="ghost" className="w-full text-xs mt-2" onClick={() => onApproval('request')}>
                  Re-request review
                </Button>
              </div>
            )}
            {task.approval_status === 'rejected' && (
              <div>
                <p className="text-xs text-red-700 font-medium">✕ Rejected</p>
                {task.approval_note && <p className="text-xs text-muted-foreground mt-1">"{task.approval_note}"</p>}
                <Button size="sm" variant="ghost" className="w-full text-xs mt-2" onClick={() => onApproval('request')}>
                  Re-request review
                </Button>
              </div>
            )}
          </div>
        ) : null}

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={task.title} required maxLength={255} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description" defaultValue={task.description ?? ''} rows={3} maxLength={2000} placeholder="Add details…" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={task.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select name="effort" defaultValue={task.effort}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">⚡ Quick (&lt;15m)</SelectItem>
                  <SelectItem value="medium">🕐 Medium (~1-4h)</SelectItem>
                  <SelectItem value="large">🔥 Large (Days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select name="assignee_id" defaultValue={task.assignee_id ?? ''}>
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
            <div className="space-y-1.5">
              <Label htmlFor="edit-due-date">Due Date</Label>
              <Input id="edit-due-date" name="due_date" type="date" defaultValue={task.due_date ?? ''} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <AlertDialog>
              <AlertDialogTrigger render={<Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone. All comments will also be deleted.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" size="sm" disabled={pending}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>

        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground">
          Created {format(new Date(task.created_at), 'MMM d, yyyy')}
        </div>
      </SheetContent>
    </Sheet>
  )
}
