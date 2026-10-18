# Dashboard de Fábrica de Confecção

Next.js 14 (App Router) + TailwindCSS + Supabase (Auth + Database) + Recharts + Lucide.

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run dev                  # http://localhost:3000
```

## Subir na Vercel em 3 passos

**1. Supabase** – Crie um projeto em supabase.com. Em *SQL Editor* cole e rode o arquivo `supabase.sql`.
Em *Project Settings → API* copie a **Project URL** e a **anon public key**.
(Dica: em *Authentication → Providers → Email* desligue "Confirm email" para entrar logo após criar a conta.)

**2. GitHub** – Suba esta pasta para um repositório:
```bash
git init && git add . && git commit -m "fábrica" 
git branch -M main && git remote add origin SEU_REPO && git push -u origin main
```

**3. Vercel** – Em vercel.com clique *Add New → Project*, importe o repositório e, em *Environment Variables*, adicione
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Clique em **Deploy**.

## Como os números do dashboard são calculados
- **Faturamento do Mês**: soma de `quantidade × valor_unitario` dos pedidos com entrega no mês atual.
- **Total de Pedidos / Ticket Médio**: pedidos do mês e faturamento ÷ pedidos.
- **Peças em Produção**: soma das peças dos pedidos que ainda não foram entregues; o % compara as peças cortadas neste mês com o mês passado.
- Clientes, modelos e responsáveis são campos de texto livre com sugestões: digite um novo e ele é salvo.
- A tabela `custos` já está criada no banco, pronta para uma futura tela.
