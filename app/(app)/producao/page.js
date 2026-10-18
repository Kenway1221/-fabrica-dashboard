'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MODELOS, ENFESTO, CORTE, fmtData, iso, card, inp, btn } from '@/lib/constants'

const vazio = () => ({ data: iso(new Date()), modelo: '', quantidade_enfestada: '', quantidade_cortada: '', responsavel_enfesto: '', responsavel_corte: 'Gustavo', status: 'concluido' })

export default function Producao() {
  const sb = createClient()
  const [lista, setLista] = useState([])
  const [f, setF] = useState(vazio())
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function carregar() {
    const { data } = await sb.from('producao_diaria').select('*').order('data', { ascending: false }).order('created_at', { ascending: false }).limit(100)
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault(); setErro('')
    const { error } = await sb.from('producao_diaria').insert({ ...f, quantidade_enfestada: +f.quantidade_enfestada || 0, quantidade_cortada: +f.quantidade_cortada || 0 })
    if (error) return setErro(error.message)
    setF(vazio()); carregar()
  }
  async function remover(id) {
    if (!confirm('Excluir este lançamento?')) return
    await sb.from('producao_diaria').delete().eq('id', id); carregar()
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Produção diária</h1>
      <form onSubmit={salvar} className={card + ' grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        <label className="text-sm">Data<input type="date" required className={inp} value={f.data} onChange={set('data')} /></label>
        <label className="text-sm">Modelo<input required list="modelos" className={inp} value={f.modelo} onChange={set('modelo')} /></label>
        <label className="text-sm">Qtd. enfestada<input type="number" min="0" required className={inp} value={f.quantidade_enfestada} onChange={set('quantidade_enfestada')} /></label>
        <label className="text-sm">Qtd. cortada<input type="number" min="0" required className={inp} value={f.quantidade_cortada} onChange={set('quantidade_cortada')} /></label>
        <label className="text-sm">Quem enfestou<input list="enfesto" className={inp} value={f.responsavel_enfesto} onChange={set('responsavel_enfesto')} /></label>
        <label className="text-sm">Quem cortou<input list="corte" className={inp} value={f.responsavel_corte} onChange={set('responsavel_corte')} /></label>
        <label className="text-sm">Status
          <select className={inp} value={f.status} onChange={set('status')}><option value="em_andamento">Em andamento</option><option value="concluido">Concluído</option></select>
        </label>
        <div className="flex items-end"><button className={btn + ' w-full'}><Plus size={16} />Lançar produção</button></div>
        {erro && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{erro}</p>}
        <datalist id="modelos">{MODELOS.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="enfesto">{ENFESTO.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="corte">{CORTE.map((x) => <option key={x} value={x} />)}</datalist>
      </form>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead><tr className="text-left text-gray-500 border-b">
              {['Data', 'Modelo', 'Enfestada', 'Cortada', 'Enfestou', 'Cortou', 'Status', ''].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {lista.map((x) => (
                <tr key={x.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{fmtData(x.data)}</td><td className="pr-4">{x.modelo}</td>
                  <td className="pr-4">{x.quantidade_enfestada}</td><td className="pr-4">{x.quantidade_cortada}</td>
                  <td className="pr-4">{x.responsavel_enfesto}</td><td className="pr-4">{x.responsavel_corte}</td>
                  <td className="pr-4">{x.status === 'concluido' ? 'Concluído' : 'Em andamento'}</td>
                  <td><button onClick={() => remover(x.id)} className="text-gray-400 hover:text-red-600" aria-label="Excluir"><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {!lista.length && <tr><td colSpan={8} className="py-6 text-center text-gray-500">Nenhum lançamento ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
