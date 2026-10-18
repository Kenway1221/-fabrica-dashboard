'use client'
import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, Pencil, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CLIENTES, MODELOS, STATUS_PEDIDO, STATUS_COR, brl, fmtData, iso, card, inp, btn } from '@/lib/constants'

const vazio = () => ({ cliente: '', modelo: '', quantidade: '', valor_unitario: '', data_entrega: iso(new Date()), status: 'a_enfestar' })

export default function Pedidos() {
  const sb = createClient()
  const [lista, setLista] = useState([])
  const [f, setF] = useState(vazio())
  const [editId, setEditId] = useState(null)
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function carregar() {
    let q = sb.from('pedidos').select('*').order('data_entrega', { ascending: true })
    if (de) q = q.gte('data_entrega', de)
    if (ate) q = q.lte('data_entrega', ate)
    const { data } = await q
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [de, ate])

  async function salvar(e) {
    e.preventDefault(); setErro('')
    const dados = { ...f, quantidade: +f.quantidade || 0, valor_unitario: +f.valor_unitario || 0 }
    const { error } = editId ? await sb.from('pedidos').update(dados).eq('id', editId) : await sb.from('pedidos').insert(dados)
    if (error) return setErro(error.message)
    cancelar(); carregar()
  }
  function editar(p) {
    setEditId(p.id)
    setF({ cliente: p.cliente, modelo: p.modelo, quantidade: p.quantidade, valor_unitario: p.valor_unitario, data_entrega: p.data_entrega, status: p.status })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancelar() { setEditId(null); setF(vazio()) }
  async function remover(id) { if (confirm('Excluir este pedido?')) { await sb.from('pedidos').delete().eq('id', id); carregar() } }
  async function mudarStatus(id, status) { await sb.from('pedidos').update({ status }).eq('id', id); carregar() }

  return (
    <>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <form onSubmit={salvar} className={card + ' grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        <label className="text-sm">Cliente<input required list="clientes" className={inp} value={f.cliente} onChange={set('cliente')} /></label>
        <label className="text-sm">Modelo<input required list="modelos" className={inp} value={f.modelo} onChange={set('modelo')} /></label>
        <label className="text-sm">Quantidade<input type="number" min="1" required className={inp} value={f.quantidade} onChange={set('quantidade')} /></label>
        <label className="text-sm">Valor por peça (R$)<input type="number" min="0" step="0.01" className={inp} value={f.valor_unitario} onChange={set('valor_unitario')} /></label>
        <label className="text-sm">Data de entrega<input type="date" required className={inp} value={f.data_entrega} onChange={set('data_entrega')} /></label>
        <label className="text-sm">Status
          <select className={inp} value={f.status} onChange={set('status')}>{Object.entries(STATUS_PEDIDO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
          <button className={btn}>{editId ? <><Save size={16} />Salvar alterações</> : <><Plus size={16} />Adicionar pedido</>}</button>
          {editId && <button type="button" onClick={cancelar} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><X size={16} />Cancelar</button>}
        </div>
        {erro && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{erro}</p>}
        <datalist id="clientes">{CLIENTES.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="modelos">{MODELOS.map((x) => <option key={x} value={x} />)}</datalist>
      </form>

      <div className={card}>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <label className="text-sm">Entrega de<input type="date" className={inp} value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="text-sm">até<input type="date" className={inp} value={ate} onChange={(e) => setAte(e.target.value)} /></label>
          {(de || ate) && <button onClick={() => { setDe(''); setAte('') }} className="text-sm text-gray-500 underline pb-2">Limpar filtro</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead><tr className="text-left text-gray-500 border-b">
              {['Entrega', 'Cliente', 'Modelo', 'Qtd.', 'Total', 'Status', ''].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{fmtData(p.data_entrega)}</td><td className="pr-4">{p.cliente}</td><td className="pr-4">{p.modelo}</td>
                  <td className="pr-4">{p.quantidade}</td><td className="pr-4">{brl(p.quantidade * p.valor_unitario)}</td>
                  <td className="pr-4">
                    <select value={p.status} onChange={(e) => mudarStatus(p.id, e.target.value)}
                      className="rounded-full border-0 px-2 py-1 text-xs font-medium text-white" style={{ background: STATUS_COR[p.status] }}>
                      {Object.entries(STATUS_PEDIDO).map(([k, v]) => <option key={k} value={k} className="text-ink bg-white">{v}</option>)}
                    </select>
                  </td>
                  <td className="whitespace-nowrap">
                    <button onClick={() => editar(p)} className="text-gray-400 hover:text-ink mr-3" aria-label="Editar"><Pencil size={16} /></button>
                    <button onClick={() => remover(p.id)} className="text-gray-400 hover:text-red-600" aria-label="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!lista.length && <tr><td colSpan={7} className="py-6 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
