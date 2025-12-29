import { supabase } from '../lib/supabase/client'

export async function createCapture(content: string) {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  return supabase.from('captures').insert({
    user_id: user.id,
    type: 'text',
    raw_content: content
  })
}
