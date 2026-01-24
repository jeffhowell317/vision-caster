import { createClient } from '@/lib/supabase/server'

export default async function MusingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <p>You must be logged in.</p>
  }

  const { data: musings } = await supabase
    .from('musings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Musings</h1>

      <form action="/musings/new" method="post">
        <textarea
          name="content"
          placeholder="What’s on your mind today?"
          rows={4}
          style={{ width: '100%' }}
        />
        <button type="submit">Save Musing</button>
      </form>

      <hr />

      <ul>
        {musings?.map(musing => (
          <li key={musing.id} style={{ marginBottom: 12 }}>
            <div>{musing.content}</div>
            <small>{new Date(musing.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}
