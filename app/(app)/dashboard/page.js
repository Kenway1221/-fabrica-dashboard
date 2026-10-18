import { DollarSign, ShoppingBag, Receipt, Factory, TrendingUp, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProducaoLine, StatusPie } from '@/components/charts'
import { STATUS_PEDIDO, STATUS_COR, brl, fmtData, iso, card } from '@/lib/constants'

export const dynamic = 'force-dynamic'
const soma = (arr, f) => arr.reduce((s, x) => s + Number(f(x) || 0), 0)

export default async function Dashboard() {
  const sb = createClient()
  const [{ data: p }, { data: pr }] = await Promise.all([
    sb.from('pedidos').select('*'),
    sb.from('producao_diaria').select('*').order('data', { ascending: false }).order('created_at', { ascending: false }),
  ])
  const pedidos = p || [], prod = pr || []
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const ini = iso(new Date(y, m, 1)), fim = iso(new Date(y, m + 1, 0))
  const iniAnt = iso(new Date(y, m - 1, 1)), fimAnt = iso(new Date(y, m, 0))

  const pedMes = pedidos.filter((x) => x.data_entrega >= ini && x.data_entrega <= fim)
  const faturamento = soma(pedMes, (x) => x.quantidade * x.valor_unitario)
  const lucroMes = soma(pedMes, (x) => x.quantidade * (x.lucro_unitario || 0))
  const ticket = pedMes.length ? faturamento / pedMes.length : 0
  const emProducao = soma(pedidos.filter((x) => x.status !== 'entregue' && x.status !== 'cancelado'), (x) => x.quantidade)
  
  const cortMes = soma(prod.filter((x) => x.data >= ini && x.data <= fim), (x) => x.quantidade_cortada)
  const cortAnt = soma(prod.filter((x) => x.data >= iniAnt && x.data <= fimAnt), (x) => x.quantidade_cortada)
  const cresc = cortAnt > 0 ? ((cortMes - cortAnt) / cortAnt) * 100 : null

  const linha = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i))
    const k = iso(d), doDia = prod.filter((x) => x.data === k)
    return { dia: k.slice(8) + '/' + k.slice(5, 7), enfestada: soma(doDia, (x) => x.quantidade_enfestada), cortada: soma(doDia, (x) => x.quantidade_cortada) }
  })
  const pizza = Object.keys(STATUS_PEDIDO)
    .map((s) => ({ name: STATUS_PEDIDO[s], value: pedidos.filter((x) => x.status === s).length, color: STATUS_COR[s] }))
    .filter((d) => d.value > 0)

  const stats = [
    { t: 'Faturamento do Mês', v: brl(faturamento), Icon: DollarSign },
    { t: 'Lucro do Mês', v: brl(lucroMes), Icon: DollarSign },
    { t: 'Total de Pedidos', v: pedMes.length, Icon: ShoppingBag },
    { t: 'Ticket Médio', v: brl(ticket), Icon: Receipt },
    { t: 'Peças em Produção', v: emProducao.toLocaleString('pt-BR'), Icon: Factory, cresc },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold">Visão Geral - Fábrica</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ t, v, Icon, cresc }) => (
          <div key={t} className={card}>
            <div className="flex items-center justify-between text-gray-500 text-sm">{t}<Icon size={18} /></div>
            <p className="mt-2 text-2xl font-bold">{v}</p>
            {cresc !== undefined && (
              <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${cresc === null ? 'text-gray-400' : cresc >= 0 ? 'text-brand' : 'text-red-500'}`}>
                {cresc === null ? 'Sem dados do mês passado' : (<>{cresc >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{cresc >= 0 ? '+' : ''}{cresc.toFixed(1)}% <span className="text-gray-400 font-normal">vs mês passado</span></>)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={card + ' lg:col-span-2'}>
          <h2 className="font-semibold mb-3">Produção - últimos 7 dias</h2>
          <ProducaoLine data={linha} />
        </div>
        <div className={card}>
          <h2 className="font-semibold mb-3">Status dos pedidos</h2>
          <StatusPie data={pizza} />
        </div>
      </div>

      <div className={card}>
        <h2 className="font-semibold mb-3">Produção Recente</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr className="text-left text-gray-500 border-b">
              {['Data', 'Modelo', 'Enfestada', 'Cortada', 'Enfestou', 'Cortou'].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {prod.slice(0, 5).map((x) => (
                <tr key={x.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{fmtData(x.data)}</td><td className="pr-4">{x.modelo}</td>
                  <td className="pr-4">{x.quantidade_enfestada}</td><td className="pr-4">{x.quantidade_cortada}</td>
                  <td className="pr-4">{x.responsavel_enfesto}</td><td>{x.responsavel_corte}</td>
                </tr>
              ))}
              {!prod.length && <tr><td colSpan={6} className="py-6 text-center text-gray-500">Nenhum lançamento ainda. Vá em Produção para lançar o primeiro.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
