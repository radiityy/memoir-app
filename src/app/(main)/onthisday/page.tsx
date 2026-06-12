'use client'

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Memory = {
  id: string
  photo_url: string
  caption: string
  mood: string | null
  location: string | null
  tape_color: string
  created_at: string
}

export default function OnThisDayPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOnThisDay = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const todayDate = new Date()
    const month = todayDate.getMonth() + 1
    const day = todayDate.getDate()

    const { data } = await supabase
      .from('memories')
      .select('*')
      .filter('created_at', 'lt', `${todayDate.getFullYear()}-01-01`)

    if (data) {
      const filtered = data.filter((memory) => {
        const memoryDate = new Date(memory.created_at)
        return (
          memoryDate.getMonth() + 1 === month &&
          memoryDate.getDate() === day
        )
      })

      setMemories(filtered)
    }

    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchOnThisDay()
  }, [fetchOnThisDay])

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-sm text-[#888780]">memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="mb-6">
          <p className="font-serif text-2xl text-[#1a1a18]">{today}</p>
          <p className="text-sm text-[#888780] mt-1">
            kenangan dari tahun-tahun lalu
          </p>
        </div>

        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <p className="font-serif text-lg text-[#888780]">
              belum ada kenangan.
            </p>
            <p className="text-sm text-[#B4B2A9]">
              tahun depan, hari ini akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {memories.map((memory) => {
              const year = new Date(memory.created_at).getFullYear()
              const yearsAgo = new Date().getFullYear() - year

              return (
                <div key={memory.id}>
                  <p className="text-xs text-[#888780] uppercase tracking-widest mb-3">
                    {year} · {yearsAgo} tahun lalu
                  </p>

                  <button
                    onClick={() => router.push(`/feed/${memory.id}`)}
                    className="relative w-48"
                  >
                    <div
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-3.5 rounded-sm opacity-85 z-10"
                      style={{ background: memory.tape_color }}
                    />

                    <div className="bg-white border border-[#e0d9ce] p-2.5 pb-8 text-left">
                      <img
                        src={memory.photo_url}
                        alt={memory.caption}
                        className="w-full aspect-square object-cover"
                      />

                      <p className="font-serif text-xs text-[#2C2C2A] mt-2 line-clamp-2 leading-relaxed">
                        {memory.caption}
                      </p>

                      {memory.mood && (
                        <span className="text-[9px] text-[#5F5E5A] bg-[#f0ece4] px-2 py-0.5 rounded-full mt-1.5 inline-block">
                          {memory.mood}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}