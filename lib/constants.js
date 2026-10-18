export const STATUS_PEDIDO = { a_enfestar: 'A enfestar', cortando: 'Cortando', na_costureira: 'Na costureira', entregue: 'Entregue' }
export const STATUS_COR = { a_enfestar: '#F59E0B', cortando: '#3B82F6', na_costureira: '#8B5CF6', entregue: '#10B981' }
// Sugestões (os campos aceitam qualquer texto, então tudo é editável)
export const CLIENTES = ['Belíssima', 'Rio das Pedras', 'Jhonny', 'Rua']
export const MODELOS = ['Cropped Viés', 'Regata Alana', 'Blusa Tala', 'Gola Boba', 'Assimétrica', 'Sarah', 'Karla']
export const ENFESTO = ['Daniel', 'Carlos', 'Diogo', 'Leo']
export const CORTE = ['Gustavo']
export const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtData = (d) => (d ? d.split('-').reverse().join('/') : '-')
export const iso = (d) => d.toLocaleDateString('en-CA')
export const card = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
export const inp = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand'
export const btn = 'inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50'
