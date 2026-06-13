'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.replace('/login')
    router.refresh()
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
    <div className="border-b border-[#e0d9ce] bg-[#f7f4ef] sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <h1
          onClick={() => router.push('/feed')}
          className="font-serif text-xl text-[#1a1a18] tracking-wide cursor-pointer"
        >
          memoir<span className="text-[#c0392b]">.</span>
        </h1>

        <div className="hidden md:flex bg-[#ede9e1] rounded-full px-1 py-1 gap-1">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/feed/upload')}
            className="bg-[#1a1a18] text-[#f7f4ef] text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline ml-1">New Memory</span>
          </button>

          <button
            onClick={handleLogout}
            className="hidden md:block text-xs text-[#888780] hover:text-[#1a1a18] transition-colors"
          >
            sign out
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#888780] hover:text-[#1a1a18] transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></>
                : <><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="12" x2="17" y2="12"/><line x1="3" y1="18" x2="17" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#e0d9ce] bg-white px-4 py-3 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.href}
              onClick={() => { router.push(tab.href); setMenuOpen(false) }}
              className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(tab.href)
                  ? 'bg-[#f7f4ef] text-[#1a1a18] font-medium'
                  : 'text-[#888780]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="text-left px-3 py-2.5 text-sm text-[#c0392b] mt-1"
          >
            sign out
          </button>
        </div>
      )}
    </div>
  )
}