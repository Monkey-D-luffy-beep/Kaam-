import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json()
    const name    = (body.name    ?? '').trim()
    const email   = (body.email   ?? '').trim().toLowerCase()
    const phone   = (body.phone   ?? '').trim()
    const message = (body.message ?? '').trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('contact_requests')
      .insert({ name, email, phone: phone || null, message })

    if (error) {
      console.error('Contact insert error:', error)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }
}
