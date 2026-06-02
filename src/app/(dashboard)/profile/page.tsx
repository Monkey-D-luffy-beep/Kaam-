import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { ProfileClient } from '@/components/profile/profile-client'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Profile" />
      <div className="flex-1 p-4 sm:p-6 max-w-lg">
        <ProfileClient profile={profile} userEmail={user.email ?? ''} />
      </div>
    </div>
  )
}
