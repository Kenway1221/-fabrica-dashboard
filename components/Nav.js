'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Scissors, ClipboardList, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/producao', label: 'Produção', Icon: Scissors },
  { href: '/pedidos', label: 'Pedidos', Icon: ClipboardList },
]

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  async function sair() { await createClient().auth.signOut(); router.push('/login'); router.refresh() }
  return (
    <header className="bg-ink text-white sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
        <span className="font-semibold flex items-center gap-2"><Scissors size={18} className="text-brand" />Fábrica</span>
        <nav className="flex-1 flex gap-1 overflow-x-auto">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap ${path.startsWith(href) ? 'bg-white/15' : 'text-gray-300 hover:bg-white/10'}`}>
              <Icon size={16} /><span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={sair} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><LogOut size={16} /><span className="hidden sm:inline">Sair</span></button>
      </div>
    </header>
  )
}
