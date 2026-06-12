'use client'

/* eslint-disable @next/next/no-img-element */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'

const MOODS = [
  'bahagia',
  'tenang',
  'nostalgia',
  'syukur',
  'semangat',
  'lelah',
  'galau',
  'bangga',
]

const TAPE_COLORS = ['#fac775', '#AFA9EC', '#9FE1CB', '#F4C0D1', '#f0997b', '#a8d8ea']

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [caption, setCaption] = useState('')
  const [mood, setMood] = useState('')
  const [location, setLocation] = useState('')
  const [tapeColor, setTapeColor] = useState(TAPE_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]

    if (!selectedFile) return

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
  })

  async function handleSave() {
    if (!file) {
      setError('Pilih foto dulu ya.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(path, file)

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('memories').getPublicUrl(path)

      const { error: dbError } = await supabase.from('memories').insert({
        user_id: user.id,
        photo_url: publicUrl,
        caption,
        mood,
        location,
        tape_color: tapeColor,
      })

      if (dbError) {
        throw dbError
      }

      router.push('/feed')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload gagal.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0d9ce] bg-[#f7f4ef] sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#888780] hover:text-[#1a1a18] transition-colors flex items-center gap-1"
        >
          ← kembali
        </button>

        <h1 className="font-serif text-lg text-[#1a1a18]">memory baru</h1>

        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-6">
        <div className="flex gap-5 items-start">
          <div className="shrink-0 w-40 relative mt-3">
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-3 rounded-sm opacity-85 z-10 transition-colors duration-200"
              style={{
                background: tapeColor,
                transform: 'translateX(-50%) rotate(-2deg)',
              }}
            />

            <div className="bg-white border border-[#e0d9ce] p-2 pb-7">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-[#f0ece4] flex items-center justify-center">
                  <span className="text-xs text-[#B4B2A9]">foto</span>
                </div>
              )}

              <p className="font-serif text-[10px] text-[#2C2C2A] mt-2 line-clamp-2 leading-relaxed min-h-[28px]">
                {caption || (
                  <span className="text-[#B4B2A9] italic">caption...</span>
                )}
              </p>

              <p className="text-[9px] text-[#B4B2A9] mt-1">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>

              {mood && (
                <span className="text-[9px] text-[#5F5E5A] bg-[#f0ece4] px-2 py-0.5 rounded-full mt-1 inline-block">
                  {mood}
                </span>
              )}
            </div>

            <div className="mt-3">
              <p className="text-[10px] text-[#888780] uppercase tracking-wide mb-1.5">
                selotip
              </p>

              <div className="flex gap-1.5 flex-wrap">
                {TAPE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTapeColor(color)}
                    className="w-5 h-2.5 rounded-sm transition-all"
                    style={{
                      background: color,
                      opacity: tapeColor === color ? 1 : 0.5,
                      outline: tapeColor === color ? '2px solid #1a1a18' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-[#888780] uppercase tracking-wide mb-1.5">
                foto
              </p>

              <div
                {...getRootProps()}
                className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-[#1a1a18] bg-[#e0d9ce]'
                    : 'border-[#e0d9ce] hover:border-[#1a1a18]'
                }`}
              >
                <input {...getInputProps()} />

                <p className="text-xs text-[#B4B2A9]">
                  {isDragActive ? 'lepas di sini' : 'klik atau drag foto'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#888780] uppercase tracking-wide mb-1.5">
                caption
              </p>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="tulis sesuatu tentang momen ini..."
                rows={3}
                className="w-full bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2 text-sm text-[#1a1a18] font-serif outline-none focus:border-[#1a1a18] transition-colors resize-none placeholder:text-[#B4B2A9] placeholder:not-italic"
              />
            </div>

            <div>
              <p className="text-[10px] text-[#888780] uppercase tracking-wide mb-1.5">
                mood
              </p>

              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setMood(mood === item ? '' : item)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      mood === item
                        ? 'bg-[#1a1a18] text-[#f7f4ef] border-[#1a1a18]'
                        : 'bg-white text-[#5F5E5A] border-[#e0d9ce] hover:border-[#1a1a18]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#888780] uppercase tracking-wide mb-1.5">
                lokasi
              </p>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="di mana momen ini?"
                className="w-full bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors placeholder:text-[#B4B2A9]"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-[#c0392b]">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading || !file}
          className="w-full bg-[#1a1a18] text-[#f7f4ef] rounded-lg py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'menyimpan...' : 'simpan memory'}
        </button>
      </div>
    </div>
  )
}