'use client'

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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

function normalizeText(value: string | null) {
  return value?.toLowerCase().trim() || ''
}

function getMemoryMonth(memory: Memory) {
  return new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedMood, setSelectedMood] = useState('all')
  const [search, setSearch] = useState('')

  const fetchMemories = useCallback(async () => {
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      const memoriesWithSignedUrls = await Promise.all(
        data.map(async (memory) => {
          if (!memory.photo_path) return memory

          const { data: signedData } = await supabase.storage
            .from('memories')
            .createSignedUrl(memory.photo_path, 60 * 60)

          return {
            ...memory,
            photo_url: signedData?.signedUrl || memory.photo_url,
          }
        }),
      )

      setMemories(memoriesWithSignedUrls)
    }

    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const allMonths = useMemo(() => {
    const months = memories.map((memory) => getMemoryMonth(memory))
    return Array.from(new Set(months))
  }, [memories])

  const filteredMemories = useMemo(() => {
    const searchValue = search.toLowerCase().trim()

    return memories.filter((memory) => {
      const memoryMonth = getMemoryMonth(memory)

      const matchesMonth =
        selectedMonth === 'all' || memoryMonth === selectedMonth

      const matchesMood = selectedMood === 'all' || memory.mood === selectedMood

      const matchesSearch =
        !searchValue ||
        normalizeText(memory.caption).includes(searchValue) ||
        normalizeText(memory.location).includes(searchValue) ||
        normalizeText(memory.mood).includes(searchValue)

      return matchesMonth && matchesMood && matchesSearch
    })
  }, [memories, search, selectedMonth, selectedMood])

  const keptCloseMemories = filteredMemories.filter(
    (memory) => memory.is_favorite,
  )

  const grouped = filteredMemories.reduce<Record<string, Memory[]>>(
    (acc, memory) => {
      const month = getMemoryMonth(memory)

      if (!acc[month]) {
        acc[month] = []
      }

      acc[month].push(memory)

      return acc
    },
    {},
  )

  const hasActiveFilter =
    search.trim() !== '' || selectedMood !== 'all' || selectedMonth !== 'all'

  function clearFilters() {
    setSearch('')
    setSelectedMood('all')
    setSelectedMonth('all')
  }

  function renderMemoryCard(
    memory: Memory,
    index: number,
    variant: 'default' | 'favorite' = 'default',
  ) {
    const rotation = index % 2 === 0 ? '-2deg' : '2deg'
    const isFavorite = variant === 'favorite'

    return (
      <button
        key={`${variant}-${memory.id}`}
        onClick={() => router.push(`/feed/${memory.id}`)}
        className="shrink-0 w-36 relative"
      >
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-sm opacity-85 z-10"
          style={{
            background: memory.tape_color,
            transform: `translateX(-50%) rotate(${rotation})`,
          }}
        />

        <div
          className={`border p-2 pb-6 ${
            isFavorite
              ? 'bg-[#1a1a18] border-[#1a1a18]'
              : 'bg-white border-[#e0d9ce]'
          }`}
        >
          <img
            src={memory.photo_url}
            alt={memory.caption}
            className="w-full aspect-square object-cover"
          />

          <p
            className={`font-serif text-[10px] mt-2 line-clamp-2 leading-relaxed text-left ${
              isFavorite ? 'text-[#f7f4ef]' : 'text-[#2C2C2A]'
            }`}
          >
            {memory.caption}
          </p>

          <p
            className={`text-[9px] mt-1 text-left ${
              isFavorite ? 'text-[#888780]' : 'text-[#B4B2A9]'
            }`}
          >
            {isFavorite
              ? 'kept close'
              : new Date(memory.created_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
          </p>

          {memory.mood && (
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full mt-1 inline-block ${
                isFavorite
                  ? 'text-[#f0ece4] bg-white/10'
                  : 'text-[#5F5E5A] bg-[#f0ece4]'
              }`}
            >
              {memory.mood}
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="flex">
        <div className="w-28 shrink-0 px-3 py-5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-[#e0d9ce]">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg mb-2 transition-colors ${
              selectedMonth === 'all' ? 'bg-[#1a1a18]' : 'hover:bg-[#e0d9ce]'
            }`}
          >
            <span
              className={`text-xs ${
                selectedMonth === 'all'
                  ? 'text-[#f7f4ef] font-medium'
                  : 'text-[#2C2C2A]'
              }`}
            >
              all
            </span>

            <span
              className={`text-xs ${
                selectedMonth === 'all' ? 'text-[#888780]' : 'text-[#B4B2A9]'
              }`}
            >
              {memories.length}
            </span>
          </button>

          {allMonths.map((month, index) => {
            const [monthName] = month.split(' ')
            const isActive = month === selectedMonth
            const count = memories.filter(
              (memory) => getMemoryMonth(memory) === month,
            ).length

            const dotColors = [
              '#c0392b',
              '#BA7517',
              '#1D9E75',
              '#7F77DD',
              '#185FA5',
            ]

            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-[#1a1a18]' : 'hover:bg-[#e0d9ce]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: dotColors[index % dotColors.length],
                    }}
                  />

                  <span
                    className={`text-xs ${
                      isActive
                        ? 'text-[#f7f4ef] font-medium'
                        : 'text-[#2C2C2A]'
                    }`}
                  >
                    {monthName}
                  </span>
                </div>

                <span
                  className={`text-xs ${
                    isActive ? 'text-[#888780]' : 'text-[#B4B2A9]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex-1 px-5 py-5 overflow-x-hidden">
          <div className="mb-5">
            <div className="mb-4">
              <label className="block text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">
                search
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="search your memories..."
                className="w-full rounded-xl border border-[#e0d9ce] bg-[#fdfcf8] px-4 py-3 text-sm text-[#2C2C2A] outline-none placeholder:text-[#B4B2A9] focus:border-[#1a1a18]"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedMood('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${
                  selectedMood === 'all'
                    ? 'bg-[#1a1a18] text-[#f7f4ef]'
                    : 'bg-[#f0ece4] text-[#5F5E5A]'
                }`}
              >
                all
              </button>

              {MOODS.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedMood(item)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${
                    selectedMood === item
                      ? 'bg-[#1a1a18] text-[#f7f4ef]'
                      : 'bg-[#f0ece4] text-[#5F5E5A]'
                  }`}
                >
                  {item}
                </button>
              ))}

              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="shrink-0 rounded-full border border-[#e0d9ce] px-3 py-1.5 text-xs text-[#888780] transition-colors hover:border-[#1a1a18] hover:text-[#1a1a18]"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[#888780]">loading...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
              <p className="font-serif text-lg text-[#888780]">
                no memories yet.
              </p>

              <p className="text-sm text-[#B4B2A9]">
                start with one small moment.
              </p>

              <button
                onClick={() => router.push('/feed/upload')}
                className="mt-2 bg-[#1a1a18] text-[#f7f4ef] text-xs font-medium px-4 py-2 rounded-lg"
              >
                + First memory
              </button>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
              <p className="font-serif text-lg text-[#888780]">
                no memories found.
              </p>

              <p className="text-sm text-[#B4B2A9]">
                try another word, mood, or month.
              </p>

              <button
                onClick={clearFilters}
                className="mt-2 border border-[#e0d9ce] text-[#5F5E5A] text-xs font-medium px-4 py-2 rounded-lg hover:border-[#1a1a18] hover:text-[#1a1a18]"
              >
                clear filters
              </button>
            </div>
          ) : (
            <>
              {keptCloseMemories.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-[#e0d9ce]" />
                    <span className="font-serif text-xs text-[#B4B2A9] tracking-widest uppercase">
                      kept close
                    </span>
                    <div className="h-px flex-1 bg-[#e0d9ce]" />
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {keptCloseMemories.map((memory, index) =>
                      renderMemoryCard(memory, index, 'favorite'),
                    )}
                  </div>
                </div>
              )}

              {Object.entries(grouped).map(([month, items]) => (
                <div key={month} id={month} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-[#e0d9ce]" />
                    <span className="font-serif text-xs text-[#B4B2A9] tracking-widest uppercase">
                      {month}
                    </span>
                    <div className="h-px flex-1 bg-[#e0d9ce]" />
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {items.map((memory, index) =>
                      renderMemoryCard(memory, index),
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}