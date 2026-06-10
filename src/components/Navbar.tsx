'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tabs = [
    { label: 'Feed', href: '/feed' },
    { label: 'Recap', href: '/recap' },
    { label: 'On This Day', href: '/onthisday' },
  ]

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0d9ce] bg-[#f7f4ef] sticky top-0 z-10">
      <h1
        onClick={() => router.push('/feed')}
        className="font-serif text-xl text-[#1a1a18] tracking-wide cursor-pointer"
      >
        memoir<span className="text-[#c0392b]">.</span>
      </h1>

      {/* Tabs */}
      <div className="flex bg-[#ede9e1] rounded-full px-1 py-1 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              isActive(tab.href)
                ? 'bg-white text-[#1a1a18] font-medium shadow-sm'
                : 'text-[#888780] hover:text-[#1a1a18]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/feed/upload')}
          className="bg-[#1a1a18] text-[#f7f4ef] text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <span className="text-base leading-none">+</span> Memory
        </button>
        <button
          onClick={handleLogout}
          className="text-xs text-[#888780] hover:text-[#1a1a18] transition-colors"
        >
          keluar
        </button>
      </div>
    </div>
  )
}