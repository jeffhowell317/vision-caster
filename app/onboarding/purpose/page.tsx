'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function PurposeProfilePage() {
  const [mission, setMission] = useState('')
  const [vision, setVision] = useState('')

  async function saveProfile() {
    await supabase.from('purpose_profiles').insert({
      mission,
      vision
    })
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Grounding in purpose</h1>

      <textarea
        value={mission}
        onChange={(e) => setMission(e.target.value)}
        placeholder="Mission"
        style={{ width: '100%', marginBottom: 10 }}
      />

      <textarea
        value={vision}
        onChange={(e) => setVision(e.target.value)}
        placeholder="Vision"
        style={{ width: '100%' }}
      />

      <br />
      <button onClick={saveProfile}>Save</button>
    </div>
  )
}
