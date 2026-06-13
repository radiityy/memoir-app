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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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
    }

    setLoading(false)
  }, [id, router, supabase])

  useEffect(() => {
    fetchMemory()
  }, [fetchMemory])

  async function handleDelete() {
    if (!memory) return

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

      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      router.push('/feed')
      router.refresh()
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
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
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#e0d9ce] bg-[#f7f4ef]">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#888780] hover:text-[#1a1a18] transition-colors"
        >
          ← back
        </button>

        <p className="text-sm text-[#888780] text-center truncate">
          {new Date(memory.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/feed/${id}/edit`)}
            className="text-xs text-[#5F5E5A] hover:text-[#1a1a18] transition-colors"
          >
            edit
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="text-xs text-[#c0392b] hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            delete
          </button>
        </div>
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

            <div className="flex items-center justify-between gap-3 mt-2">
              {memory.mood && (
                <span className="text-xs text-[#5F5E5A] bg-[#f0ece4] px-2.5 py-1 rounded-full">
                  {memory.mood}
                </span>
              )}

              {memory.location && (
                <span className="text-xs text-[#B4B2A9] italic text-right">
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
          onClick={() => router.push('/feed')}
          className="w-full border border-[#e0d9ce] text-[#5F5E5A] rounded-lg py-2.5 text-sm hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
        >
          back to feed
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5">
          <div className="w-full max-w-xs rounded-2xl border border-[#e0d9ce] bg-[#fdfcf8] p-5 shadow-xl">
            <p className="font-serif text-lg text-[#1a1a18]">
              delete this memory?
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#888780]">
              This memory will be removed permanently. The photo will also be
              deleted from your storage.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-[#e0d9ce] py-2.5 text-sm text-[#5F5E5A] hover:border-[#1a1a18] hover:text-[#1a1a18] disabled:opacity-50"
              >
                cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-[#c0392b] py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting ? 'deleting...' : 'delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}