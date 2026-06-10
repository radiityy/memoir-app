'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Memory = {
  id: string
  photo_url: string
  caption: string
  mood: string
  location: string
  tape_color: string
  created_at: string
}

type DayGroup = {
  date: string
  label: string
  memories: Memory[]
}

type MonthGroup = {
  month: string
  memories: Memory[]
}

export default function RecapPage() {
  const router = useRouter()
  const supabase = createClient()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemories()
  }, [])

  async function fetchMemories() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setMemories(data)
    setLoading(false)
  }

  // Group by day
  const byDay = memories.reduce((acc, memory) => {
    const date = new Date(memory.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)

  // Group by month
  const byMonth = memories.reduce((acc, memory) => {
    const month = new Date(memory.created_at).toLocaleDateString('id-ID', {
      month: 'long', year: 'numeric'
    })
    if (!acc[month]) acc[month] = []
    acc[month].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)

  const days = Object.entries(byDay)
  const months = Object.entries(byMonth)

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <p className="text-sm text-[#888780]">memuat...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-2xl mx-auto px-5 py-6">

        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="font-serif text-lg text-[#888780]">belum ada memory.</p>
            <p className="text-sm text-[#B4B2A9]">upload foto pertamamu dulu!</p>
          </div>
        ) : (
          <>
            {/* Daily recap */}
            <div className="mb-10">
              <p className="text-xs text-[#888780] uppercase tracking-widest mb-5">harian</p>

              <div className="flex flex-col gap-6">
                {days.map(([date, items]) => (
                  <div key={date} className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${items.length > 1 ? 'bg-[#c0392b]' : 'bg-[#1a1a18]'}`} />
                      <div className="w-px flex-1 bg-[#e0d9ce] mt-1" />
                    </div>

                    <div className="flex-1 pb-2">
                      <p className="text-xs text-[#888780] mb-2">{date}</p>

                      {/* Foto-foto */}
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {items.map(memory => (
                          <button
                            key={memory.id}
                            onClick={() => router.push(`/feed/${memory.id}`)}
                            className="relative shrink-0"
                          >
                            <div
                              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 rounded-sm opacity-85 z-10"
                              style={{ background: memory.tape_color }}
                            />
                            <div className="bg-white border border-[#e0d9ce] p-1.5 pb-4 w-20">
                              <img
                                src={memory.photo_url}
                                alt={memory.caption}
                                className="w-full aspect-square object-cover"
                              />
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* AI reflection placeholder */}
                      <div className="bg-[#fdfcf8] border border-[#e8e0d0] rounded-lg px-4 py-3">
                        <p className="text-[9px] text-[#B4B2A9] uppercase tracking-widest mb-1.5">refleksi</p>
                        <p className="font-serif text-xs text-[#444441] leading-relaxed italic">
                          {items.length > 1
                            ? `${items.length} momen hari ini — refleksi AI akan hadir segera.`
                            : `Satu momen hari ini — refleksi AI akan hadir segera.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly recap */}
            <div>
              <p className="text-xs text-[#888780] uppercase tracking-widest mb-5">bulanan</p>

              <div className="flex flex-col gap-4">
                {months.map(([month, items]) => {
                  const moodCount = items.reduce((acc, m) => {
                    if (m.mood) acc[m.mood] = (acc[m.mood] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0]
                  const locations = [...new Set(items.map(m => m.location).filter(Boolean))]

                  return (
                    <div key={month} className="bg-white border border-[#e0d9ce] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-serif text-sm text-[#1a1a18]">{month}</p>
                        <span className="text-xs bg-[#f0ece4] text-[#5F5E5A] px-2.5 py-1 rounded-full">
                          {items.length} memory
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-[#f7f4ef] rounded-lg p-2.5 text-center">
                          <p className="font-serif text-lg text-[#c0392b]">{items.length}</p>
                          <p className="text-[10px] text-[#888780]">memories</p>
                        </div>
                        <div className="bg-[#f7f4ef] rounded-lg p-2.5 text-center">
                          <p className="font-serif text-lg text-[#c0392b]">{locations.length}</p>
                          <p className="text-[10px] text-[#888780]">lokasi</p>
                        </div>
                        <div className="bg-[#f7f4ef] rounded-lg p-2.5 text-center">
                          <p className="font-serif text-sm text-[#1a1a18] mt-0.5">{topMood || '-'}</p>
                          <p className="text-[10px] text-[#888780]">top mood</p>
                        </div>
                      </div>

                      {/* Foto strip */}
                      <div className="grid grid-cols-5 gap-1 rounded-lg overflow-hidden">
                        {items.slice(0, 5).map(memory => (
                          <img
                            key={memory.id}
                            src={memory.photo_url}
                            alt={memory.caption}
                            className="w-full aspect-square object-cover"
                          />
                        ))}
                      </div>

                      {/* Monthly AI placeholder */}
                      <div className="mt-3 bg-[#1a1a18] rounded-lg px-4 py-3">
                        <p className="text-[9px] text-[#888780] uppercase tracking-widest mb-1.5">narasi bulan ini</p>
                        <p className="font-serif text-xs text-[#f0ece4] leading-relaxed italic">
                          narasi AI untuk {month} akan hadir segera.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}