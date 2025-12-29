'use client'

import { useState } from 'react'
import { createCapture } from '@/services/capture.service'

export default function CapturePage() {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await createCapture(content)
    setContent('')
    setSaving(false)
  }


  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Capture a moment</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', height: 150 }}
        placeholder="What stood out today?"
      />
      <br />
      <button onClick={handleSave} disabled={!content || saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
