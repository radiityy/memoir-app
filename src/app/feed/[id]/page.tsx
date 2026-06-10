'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function DetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemory()
  }, [])

  async function fetchMemory() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .single()

    if (data) setMemory(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Hapus memory ini?')) return
    await supabase.from('memories').delete().eq('id', id)
    router.push('/feed')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <p className="text-sm text-[#888780]">memuat...</p>
    </div>
  )

  if (!memory) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <p className="text-sm text-[#888780]">memory tidak ditemukan.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      {/* Navbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0d9ce] bg-[#f7f4ef] sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm text-[#888780] hover:text-[#1a1a18] transition-colors">
          ← kembali
        </button>
        <p className="text-sm text-[#888780]">
          {new Date(memory.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <button onClick={handleDelete} className="text-xs text-[#c0392b] hover:opacity-70 transition-opacity">
          hapus
        </button>
      </div>

      <div className="max-w-sm mx-auto px-5 py-8">
        {/* Polaroid besar */}
        <div className="relative mb-6">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-sm opacity-85 z-10"
            style={{ background: memory.tape_color, transform: 'translateX(-50%) rotate(-1deg)' }}
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
                <span className="text-xs text-[#B4B2A9]">📍 {memory.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Refleksi AI — placeholder dulu */}
        <div className="bg-[#fdfcf8] border border-[#e8e0d0] rounded-xl p-4 mb-4">
          <p className="text-[10px] text-[#B4B2A9] uppercase tracking-widest mb-2">refleksi hari ini</p>
          <p className="font-serif text-sm text-[#444441] leading-relaxed italic">
            refleksi AI akan muncul di sini setelah integrasi Claude selesai.
          </p>
        </div>

        <button
          onClick={() => router.push(`/feed/${id}/edit`)}
          className="w-full border border-[#e0d9ce] text-[#5F5E5A] rounded-lg py-2.5 text-sm hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
        >
          edit memory
        </button>
      </div>
    </div>
  )
}