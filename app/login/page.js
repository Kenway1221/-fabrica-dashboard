'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { inp, btn } from '@/lib/constants'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [criar, setCriar] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function enviar(e) {
    e.preventDefault(); setLoading(true); setMsg('')
    const sb = createClient()
    const { data, error } = criar
      ? await sb.auth.signUp({ email, password: senha })
      : await sb.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error) return setMsg(error.message)
    if (criar && !data.session) return setMsg('Conta criada! Confirme o e-mail e faça login.')
    router.push('/dashboard'); router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={enviar} className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2"><Scissors className="text-brand" /><h1 className="text-xl font-semibold">Fábrica</h1></div>
        <p className="text-sm text-gray-500">{criar ? 'Crie seu acesso' : 'Entre para acessar o painel'}</p>
        <input className={inp} type="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inp} type="password" placeholder="Senha (mín. 6 caracteres)" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className={btn + ' w-full'} disabled={loading}>{loading ? 'Aguarde...' : criar ? 'Criar conta' : 'Entrar'}</button>
        <button type="button" onClick={() => setCriar(!criar)} className="w-full text-sm text-gray-500 hover:text-ink">
          {criar ? 'Já tenho conta' : 'Criar uma conta'}
        </button>
      </form>
    </main>
  )
}
