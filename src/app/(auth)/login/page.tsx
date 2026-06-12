'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Password tidak sama.')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password minimal 6 karakter.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Akun berhasil dibuat. Silakan login.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      }
    } else if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Email atau password salah.')
      } else {
        router.replace('/feed')
        router.refresh()
      }
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Link reset password sudah dikirim ke emailmu.')
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl text-[#1a1a18] tracking-wide">
            memoir<span className="text-[#c0392b]">.</span>
          </h1>

          <p className="text-sm text-[#888780] mt-3">
            {mode === 'login' && 'selamat datang kembali.'}
            {mode === 'register' && 'mulai abadikan momenmu.'}
            {mode === 'reset' && 'kami kirimkan link reset ke emailmu.'}
          </p>
        </div>

        <div className="bg-white border border-[#e0d9ce] rounded-2xl p-6 flex flex-col gap-4">
          {mode !== 'reset' && (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-[#e0d9ce] rounded-lg py-2.5 text-sm text-[#1a1a18] hover:bg-[#f7f4ef] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.7 39.7 16.3 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"
                  />
                </svg>
                lanjut dengan Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#e0d9ce]" />
                <span className="text-xs text-[#B4B2A9]">atau</span>
                <div className="flex-1 h-px bg-[#e0d9ce]" />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#888780] uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="kamu@email.com"
              className="bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2.5 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors"
            />
          </div>

          {mode !== 'reset' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888780] uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2.5 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors"
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888780] uppercase tracking-wide">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="bg-[#f7f4ef] border border-[#e0d9ce] rounded-lg px-3 py-2.5 text-sm text-[#1a1a18] outline-none focus:border-[#1a1a18] transition-colors"
              />
            </div>
          )}

          {error && <p className="text-xs text-[#c0392b]">{error}</p>}
          {success && <p className="text-xs text-[#1D9E75]">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1a1a18] text-[#f7f4ef] rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
          >
            {loading
              ? 'loading...'
              : mode === 'login'
                ? 'Masuk'
                : mode === 'register'
                  ? 'Buat akun'
                  : 'Kirim link reset'}
          </button>

          <div className="flex flex-col items-center gap-2 pt-1">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => {
                    setMode('register')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-xs text-[#888780] hover:text-[#1a1a18] transition-colors"
                >
                  belum punya akun?{' '}
                  <span className="underline underline-offset-2 text-[#1a1a18]">
                    daftar
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMode('reset')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-xs text-[#B4B2A9] hover:text-[#888780] transition-colors"
                >
                  lupa password?
                </button>
              </>
            )}

            {mode === 'register' && (
              <button
                onClick={() => {
                  setMode('login')
                  setError('')
                  setSuccess('')
                }}
                className="text-xs text-[#888780] hover:text-[#1a1a18] transition-colors"
              >
                sudah punya akun?{' '}
                <span className="underline underline-offset-2 text-[#1a1a18]">
                  masuk
                </span>
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => {
                  setMode('login')
                  setError('')
                  setSuccess('')
                }}
                className="text-xs text-[#888780] hover:text-[#1a1a18] transition-colors"
              >
                kembali ke login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}