import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const source = body.source ?? 'landing'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('waitlist')
      .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
