'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/actions/projects'
import { PROJECT_COLORS } from '@/lib/constants'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createProject, undefined)
  const errors = state && !state.success ? state.errors : undefined

  useEffect(() => {
    if (state?.success && state.data) {
      toast.success(state.message)
      onOpenChange(false)
      const project = state.data as { id: string }
      router.push(ROUTES.projectBoard(project.id))
    }
  }, [state, onOpenChange, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Set up a new project to start organizing your work.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-2">
          {state && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" name="name" placeholder="Website Redesign" required maxLength={80} />
            {errors?.name && (
              <p className="text-xs text-destructive">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this project about?"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((color) => (
                <label key={color} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    defaultChecked={color === PROJECT_COLORS[0]}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-6 w-6 rounded-full transition-transform peer-checked:scale-125 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-foreground/30'
                    )}
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
