'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        router.replace('/')
        return
      }

      if (data.session) {
        router.replace('/capture')
      } else {
        router.replace('/')
      }
    }

    handleAuth()
  }, [router])

  return <p>Signing you in…</p>
}
