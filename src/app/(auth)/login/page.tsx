'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/feed')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/feed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-[#1a1a18] tracking-wide">
            memoir<span className="text-[#c0392b]">.</span>
          </h1>
          <p className="text-sm text-[#888780] mt-2">
            simpan tiap momen, satu hari satu halaman.
          </p>
        </div>

        <div className="bg-white border border-[#e0d9ce] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#888780] uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#888780] uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[#c0392b]">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1a1a18] text-[#f7f4ef] rounded-lg py-2.5 text-sm font-medium mt-1 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'loading...' : isRegister ? 'Buat akun' : 'Masuk'}
          </button>

          <p className="text-center text-xs text-[#888780]">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#1a1a18] underline underline-offset-2"
            >
              {isRegister ? 'Masuk' : 'Daftar'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}