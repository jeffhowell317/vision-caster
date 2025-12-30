'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  async function signIn() {
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
      shouldCreateUser: true
    }
  })

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Vision Caster</h1>
      <p>Enter your email to begin.</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
      />

      <br />
      <button onClick={signIn}>Send login link</button>
    </div>
  )
}
