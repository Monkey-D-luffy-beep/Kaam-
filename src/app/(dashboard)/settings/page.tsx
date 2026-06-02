import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { signOut } from '@/actions/auth'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Settings" />
      <div className="flex-1 p-4 sm:p-6 max-w-lg space-y-8">
        <section>
          <h2 className="text-sm font-semibold mb-1">Account</h2>
          <p className="text-xs text-muted-foreground mb-4">Signed in as {user.email}</p>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold mb-1">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data.
          </p>
          <Button variant="destructive" size="sm" disabled>
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Contact support to delete your account.</p>
        </section>
      </div>
    </div>
  )
}
