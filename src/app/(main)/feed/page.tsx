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

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMonth, setActiveMonth] = useState('')

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

    if (data) {
      setMemories(data)
      if (data.length > 0) {
        const firstMonth = new Date(data[0].created_at)
          .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        setActiveMonth(firstMonth)
      }
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Group memories by month
  const grouped = memories.reduce((acc, memory) => {
    const month = new Date(memory.created_at)
      .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)

  const months = Object.keys(grouped)

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-28 shrink-0 px-3 py-5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-[#e0d9ce]">
          {months.map((month, i) => {
            const [m] = month.split(' ')
            const isActive = month === activeMonth
            const dotColors = ['#c0392b', '#BA7517', '#1D9E75', '#7F77DD', '#185FA5']
            return (
              <button
                key={month}
                onClick={() => setActiveMonth(month)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg mb-1 transition-colors ${isActive ? 'bg-[#1a1a18]' : 'hover:bg-[#e0d9ce]'}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: dotColors[i % dotColors.length] }}
                  />
                  <span className={`text-xs ${isActive ? 'text-[#f7f4ef] font-medium' : 'text-[#2C2C2A]'}`}>
                    {m}
                  </span>
                </div>
                <span className={`text-xs ${isActive ? 'text-[#888780]' : 'text-[#B4B2A9]'}`}>
                  {grouped[month].length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 px-5 py-5 overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[#888780]">memuat...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="font-serif text-lg text-[#888780]">belum ada memory.</p>
              <p className="text-sm text-[#B4B2A9]">mulai abadikan momenmu hari ini.</p>
              <button
                onClick={() => router.push('/feed/upload')}
                className="mt-2 bg-[#1a1a18] text-[#f7f4ef] text-xs font-medium px-4 py-2 rounded-lg"
              >
                + Memory pertama
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month} id={month} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-[#e0d9ce]" />
                  <span className="font-serif text-xs text-[#B4B2A9] tracking-widest uppercase">{month}</span>
                  <div className="h-px flex-1 bg-[#e0d9ce]" />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {items.map(memory => (
                    <button
                      key={memory.id}
                      onClick={() => router.push(`/feed/${memory.id}`)}
                      className="shrink-0 w-36 relative"
                    >
                      {/* Tape */}
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-sm opacity-85 z-10"
                        style={{
                          background: memory.tape_color,
                          transform: `translateX(-50%) rotate(${Math.random() > 0.5 ? '-' : ''}${Math.floor(Math.random() * 3) + 1}deg)`
                        }}
                      />
                      {/* Polaroid */}
                      <div className="bg-white border border-[#e0d9ce] p-2 pb-6">
                        <img
                          src={memory.photo_url}
                          alt={memory.caption}
                          className="w-full aspect-square object-cover"
                        />
                        <p className="font-serif text-[10px] text-[#2C2C2A] mt-2 line-clamp-2 leading-relaxed text-left">
                          {memory.caption}
                        </p>
                        <p className="text-[9px] text-[#B4B2A9] mt-1 text-left">
                          {new Date(memory.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                        {memory.mood && (
                          <span className="text-[9px] text-[#5F5E5A] bg-[#f0ece4] px-2 py-0.5 rounded-full mt-1 inline-block">
                            {memory.mood}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}