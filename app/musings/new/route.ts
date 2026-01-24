import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect('/login')
  }

  const formData = await req.formData()
  const content = formData.get('content') as string

  if (!content) {
    return NextResponse.redirect('/musings')
  }

  await supabase.from('musings').insert({
    user_id: user.id,
    content,
  })

  return NextResponse.redirect('/musings')
}
