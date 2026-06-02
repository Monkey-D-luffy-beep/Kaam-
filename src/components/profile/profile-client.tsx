'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { Profile } from '@/types'
import { updateProfile, uploadAvatar } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileClientProps {
  profile: Profile | null
  userEmail: string
}

export function ProfileClient({ profile, userEmail }: ProfileClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, action, pending] = useActionState(updateProfile, undefined)
  const errors = state && !state.success ? state.errors : undefined

  useEffect(() => {
    if (state?.success) toast.success(state.message)
    else if (state && !state.success) toast.error(state.message)
  }, [state])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await uploadAvatar(fd)
    if (result.success) toast.success(result.message)
    else toast.error(result.message)
  }

  const displayName = profile?.full_name ?? userEmail.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold mb-4">Avatar</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold mb-4">Personal Information</h2>
        <form action={action} className="space-y-4">
          {state && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              required
              maxLength={100}
            />
            {errors?.full_name && (
              <p className="text-xs text-destructive">{errors.full_name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </section>
    </div>
  )
}
