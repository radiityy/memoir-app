'use client'

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Memory = {
  id: string
  photo_url: string
  photo_path: string | null
  caption: string
  mood: string | null
  location: string | null
  tape_color: string
  is_favorite: boolean
  created_at: string
}

const MOODS = [
  'happy',
  'calm',
  'nostalgic',
  'grateful',
  'hopeful',
  'tired',
  'blue',
  'proud',
]

const TAPE_COLORS = [
  '#c0392b',
  '#BA7517',
  '#1D9E75',
  '#7F77DD',
  '#185FA5',
  '#B4B2A9',
]

export default function EditMemoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const supabase = useMemo(() => createClient(), [])

  const [memory, setMemory] = useState<Memory | null>(null)
  const [caption, setCaption] = useState('')
  const [mood, setMood] = useState('')
  const [location, setLocation] = useState('')
  const [tapeColor, setTapeColor] = useState(TAPE_COLORS[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchMemory = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (data) {
      let memoryWithSignedUrl = data

      if (data.photo_path) {
        const { data: signedData } = await supabase.storage
          .from('memories')
          .createSignedUrl(data.photo_path, 60 * 60)

        memoryWithSignedUrl = {
          ...data,
          photo_url: signedData?.signedUrl || data.photo_url,
        }
      }

      setMemory(memoryWithSignedUrl)
      setCaption(data.caption || '')
      setMood(data.mood || '')
      setLocation(data.location || '')
      setTapeColor(data.tape_color || TAPE_COLORS[0])
    }

    setLoading(false)
  }, [id, router, supabase])

  useEffect(() => {
    fetchMemory()
  }, [fetchMemory])

  async function handleSave() {
    if (!caption.trim()) {
      setError('Write a caption first.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('memories')
        .update({
          caption: caption.trim(),
          mood: mood || null,
          location: location.trim() || null,
          tape_color: tapeColor,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      router.push(`/feed/${id}`)
      router.refresh()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save memory.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-sm text-[#888780]">loading...</p>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-sm text-[#888780]">memory not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0d9ce] bg-[#f7f4ef]">
        <button
          onClick={() => router.push(`/feed/${id}`)}
          className="text-sm text-[#888780] hover:text-[#1a1a18] transition-colors"
        >
          ← back
        </button>

        <p className="text-sm text-[#888780]">edit memory</p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs text-[#1a1a18] hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          {saving ? 'saving...' : 'save'}
        </button>
      </div>

      <div className="max-w-sm mx-auto px-5 py-8">
        <div className="relative mb-6">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-sm opacity-85 z-10"
            style={{
              background: tapeColor,
              transform: 'translateX(-50%) rotate(-1deg)',
            }}
          />

          <div className="bg-white border border-[#e0d9ce] p-3 pb-5">
            <img
              src={memory.photo_url}
              alt={memory.caption}
              className="w-full aspect-square object-cover"
            />

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
                  caption
                </label>

                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={4}
                  placeholder="write a little about this moment..."
                  className="w-full resize-none rounded-lg border border-[#e0d9ce] bg-[#fdfcf8] px-3 py-2.5 font-serif text-sm text-[#2C2C2A] outline-none focus:border-[#1a1a18]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
                  mood
                </label>

                <div className="flex flex-wrap gap-2">
                  {MOODS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMood(mood === item ? '' : item)}
                      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                        mood === item
                          ? 'bg-[#1a1a18] text-[#f7f4ef]'
                          : 'bg-[#f0ece4] text-[#5F5E5A]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
                  place
                </label>

                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="where did this happen?"
                  className="w-full rounded-lg border border-[#e0d9ce] bg-[#fdfcf8] px-3 py-2.5 text-sm text-[#2C2C2A] outline-none focus:border-[#1a1a18]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
                  tape
                </label>

                <div className="flex gap-2">
                  {TAPE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTapeColor(color)}
                      className={`h-7 w-7 rounded-full border transition-transform ${
                        tapeColor === color
                          ? 'scale-110 border-[#1a1a18]'
                          : 'border-transparent'
                      }`}
                      style={{ background: color }}
                      aria-label={`Choose ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-[#ead1cc] bg-[#fff7f5] px-3 py-2 text-sm text-[#c0392b]">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-[#1a1a18] py-3 text-sm font-medium text-[#f7f4ef] disabled:opacity-50"
        >
          {saving ? 'saving...' : 'save changes'}
        </button>
      </div>
    </div>
  )
}