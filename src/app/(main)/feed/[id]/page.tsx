'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Memory = {
  id: string
  photo_url: string
  photo_path: string | null
  caption: string
  mood: string | null
  location: string | null
  tape_color: string
  created_at: string
}

export default function DetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const supabase = useMemo(() => createClient(), [])

  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchMemory() {
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
        setMemory(data)
      }

      setLoading(false)
    }

    fetchMemory()
  }, [id, router, supabase])

  async function handleDelete() {
    if (!memory) return
    if (!confirm('Delete this memory?')) return

    setDeleting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (memory.photo_path) {
        await supabase.storage.from('memories').remove([memory.photo_path])
      }

      await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      router.push('/feed')
    } finally {
      setDeleting(false)
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
          onClick={() => router.back()}
          className="text-sm text-[#888780] hover:text-[#1a1a18] transition-colors"
        >
          ← back
        </button>

        <p className="text-sm text-[#888780]">
          {new Date(memory.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-[#c0392b] hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          {deleting ? 'deleting...' : 'delete'}
        </button>
      </div>

      <div className="max-w-sm mx-auto px-5 py-8">
        <div className="relative mb-6">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-sm opacity-85 z-10"
            style={{
              background: memory.tape_color,
              transform: 'translateX(-50%) rotate(-1deg)',
            }}
          />

          <div className="bg-white border border-[#e0d9ce] p-3 pb-10">
            <img
              src={memory.photo_url}
              alt={memory.caption}
              className="w-full aspect-square object-cover"
            />

            <p className="font-serif text-sm text-[#2C2C2A] mt-3 leading-relaxed">
              {memory.caption}
            </p>

            <div className="flex items-center justify-between mt-2">
              {memory.mood && (
                <span className="text-xs text-[#5F5E5A] bg-[#f0ece4] px-2.5 py-1 rounded-full">
                  {memory.mood}
                </span>
              )}

              {memory.location && (
                <span className="text-xs text-[#B4B2A9] italic">
                  from {memory.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#fdfcf8] border border-[#e8e0d0] rounded-xl p-4 mb-4">
          <p className="text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
            note
          </p>
          <p className="font-serif text-sm text-[#444441] leading-relaxed italic">
            a small piece of today, kept before it slips away.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="w-full border border-[#e0d9ce] text-[#5F5E5A] rounded-lg py-2.5 text-sm hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
        >
          back to feed
        </button>
      </div>
    </div>
  )
}