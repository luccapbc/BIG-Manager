/**
 * Dashboard.jsx — BigManager (Tailwind CSS)
 * ---------------------------------------------------------------------------
 * Dependências externas: `recharts` (gráficos) e `lucide-react` (ícones).
 *   npm install recharts lucide-react
 * Estilos: 100% classes Tailwind (não há arquivo .css).
 *
 * Tudo o que vem do backend está marcado com [BACKEND] e é lido do objeto
 * `data` (veja o formato em dashboardData.js). Nenhum número, nome ou gráfico
 * está escrito fixo neste arquivo.
 *
 * LÓGICA:
 *   - `metricId`   -> aba ativa (padrão: custoPorVenda)
 *   - `selectedId` -> produto clicado na lista (null = média geral)
 *   Tudo que aparece na tela é derivado desses dois estados.
 */
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Calculator, PieChart as PieChartIcon, Percent, Settings } from 'lucide-react';

import { fetchDashboardData } from './dashboardData';

/* ------------------------------ CONFIGURAÇÃO ------------------------------ */

// Textos fixos de interface (rótulos de tela, não dados do backend).
// `higherIsBetter` define como a meta é avaliada na lista de produtos.
const METRICS = [
  {
    id: 'custoPorVenda',
    label: 'Custo por venda',
    icon: PieChartIcon,
    higherIsBetter: false,
    barTitle: 'Custo por Venda por Produto',
    barSubtitle: 'Percentual do preço de venda consumido pelo custo',
    donutTitle: 'Composição do Preço de Venda',
    donutSubtitle: 'Distribuição entre custo, despesas e lucro',
    donutCenter: 'Custo %',
  },
  {
    id: 'margemLucro',
    label: 'Margem de Lucro',
    icon: Percent,
    higherIsBetter: true,
    barTitle: 'Margem de Lucro por Produto',
    barSubtitle: 'Margem percentual por item em estoque',
    donutTitle: 'Composição da Margem',
    donutSubtitle: 'Parcela do preço de venda que vira lucro',
    donutCenter: 'Margem %',
  },
  {
    id: 'markup',
    label: 'Markup',
    icon: ArrowUpRight,
    higherIsBetter: true,
    barTitle: 'Markup por Produto',
    barSubtitle: 'Percentual aplicado sobre o custo de cada item',
    donutTitle: 'Composição do Markup',
    donutSubtitle: 'Custo versus acréscimo no preço de venda',
    donutCenter: 'Markup %',
  },
  {
    id: 'faixaMargem',
    label: 'Faixa de margem',
    icon: Calculator,
    higherIsBetter: true,
    barTitle: 'Margem por Produto',
    barSubtitle: 'Margem percentual usada para definir a faixa de cada item',
    donutTitle: 'Distribuição por Faixa de Margem',
    donutSubtitle: 'Classificação dos produtos em faixas de margem',
    donutCenter: 'Margem %',
  },
];

// Cores usadas pelo Recharts e por estilos inline (barras de performance).
const COLORS = {
  bar: '#2563EB',
  hit: '#10B981',
  miss: '#EF4444',
  donut: ['#2563EB', '#0D9488', '#D97706'],
};

// Anel de foco visível para teclado (aplicado em todos os botões).
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]';

/* ------------------------------- FORMATADORES ------------------------------ */

const fmtPercent = (v) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)}%`);
const fmtCurrency = (v) =>
  v == null || Number.isNaN(v)
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v) => (v == null || Number.isNaN(v) ? '—' : new Intl.NumberFormat('pt-BR').format(v));

/* -------------------------------- COMPONENTE ------------------------------- */

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [metricId, setMetricId] = useState('custoPorVenda'); // aba padrão
  const [selectedId, setSelectedId] = useState(null); // null = média geral

  // [BACKEND] Carregamento dos dados do dashboard (ver dashboardData.js)
  useEffect(() => {
    let alive = true;
    fetchDashboardData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError('Não foi possível carregar o dashboard. Tente novamente.'));
    return () => {
      alive = false;
    };
  }, []);

  const metric = METRICS.find((m) => m.id === metricId);

  // Tudo abaixo é derivado de (data, metricId, selectedId)
  const view = useMemo(() => {
    if (!data) return null;
    const product = data.products.find((p) => p.id === selectedId) || null;
    const source = product || data.general; // produto selecionado OU média geral

    const rows = data.products.map((p) => ({ id: p.id, name: p.name, value: p.metrics[metricId] })); // [BACKEND]
    const goal = data.goals[metricId]; // [BACKEND]
    const scaleMax = Math.max(goal, ...rows.map((r) => r.value)) * 1.05;

    return {
      product,
      rows,
      goal,
      scaleMax,
      value: source.metrics[metricId], // [BACKEND] 4º indicador
      summary: source.summary, // [BACKEND] itens, investimento, lucro
      breakdown: source.breakdown[metricId], // [BACKEND] fatias da rosca e da legenda
    };
  }, [data, metricId, selectedId]);

  const toggleProduct = (id) => setSelectedId((cur) => (cur === id ? null : id));

  if (error)
    return (
      <div role="alert" className="p-12 text-center text-[#64748b]">
        {error}
      </div>
    );
  if (!view) return <div className="p-12 text-center text-[#64748b]">Carregando dashboard…</div>;

  const isHit = (v) => (metric.higherIsBetter ? v >= view.goal : v <= view.goal);

  return (
    <div className="min-h-screen bg-white font-[family-name:Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif] text-[#0f172a] antialiased">
      {/* ------------------------------ CABEÇALHO ----------------------------- */}
      <header className="flex h-14 items-center justify-between border-b border-[#e5e7eb] px-8 max-[560px]:px-4">
        <div className="text-xl font-extrabold tracking-[-0.03em]">
          Big<span className="text-[#2563eb]">Manager</span>
        </div>
        <div className="flex items-center gap-[14px] text-[13px]">
          <span className="text-[#64748b] max-[560px]:hidden">Dashboard de Produtos</span>
          <span aria-hidden="true" className="h-3 w-px bg-[#cbd5e1] max-[560px]:hidden" />
          <strong className="font-semibold">{data.company.name /* [BACKEND] */}</strong>
          <button
            type="button"
            aria-label="Configurações"
            className={`grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#64748b] ${FOCUS}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1072px] px-[30px] pb-12 pt-[30px] max-[560px]:px-4 max-[560px]:pb-10 max-[560px]:pt-5">
        {/* ------------------------------ GRÁFICOS ----------------------------- */}
        <section className="grid grid-cols-2 gap-[26px] max-[900px]:grid-cols-1">
          {/* Gráfico de barras: métrica de cada produto */}
          <article className="min-h-[286px] rounded-xl border border-[#e5e7eb] bg-white px-[18px] pb-5 pt-[18px]">
            <h2 className="text-[13px] font-semibold">{metric.barTitle}</h2>
            <p className="mt-1 text-[11px] text-[#64748b]">{metric.barSubtitle}</p>

            <div 
                className="mt-[14px] h-[208px] [&_*]:outline-none "
                onMouseDown={(e) => e.preventDefault()}>
                    
              <ResponsiveContainer width="100%" height="100%">
                {/* [BACKEND] `view.rows` alimenta as barras */}
                <BarChart data={view.rows} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis hide domain={[0, (max) => max * 1.1]} />
                  <Tooltip
                    cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
                    formatter={(v) => [fmtPercent(v), metric.label]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={24} onClick={(row) => toggleProduct(row.id)}>
                    {view.rows.map((r) => (
                      <Cell
                        key={r.id}
                        fill={COLORS.bar}
                        fillOpacity={selectedId && selectedId !== r.id ? 0.25 : 1}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* Gráfico de rosca + legenda */}
          <article className="min-h-[286px] rounded-xl border border-[#e5e7eb] bg-white px-[18px] pb-5 pt-[18px]">
            <h2 className="text-[13px] font-semibold">{metric.donutTitle}</h2>
            <p className="mt-1 text-[11px] text-[#64748b]">{metric.donutSubtitle}</p>

            <div className="mt-8 flex items-center gap-8 px-1 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-5">
              <div className="relative h-[118px] w-[118px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* [BACKEND] `view.breakdown` = [{ label, value }] */}
                    <Pie
                      data={view.breakdown}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="68%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {view.breakdown.map((s, i) => (
                        <Cell key={s.label} fill={COLORS.donut[i % COLORS.donut.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [fmtPercent(v), name]}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-center text-xs font-bold">
                  {metric.donutCenter}
                </span>
              </div>

              <ul className="grid flex-1 gap-[14px] text-xs max-[560px]:w-full">
                {view.breakdown.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-2">
                    <span
                      className="h-[9px] w-[9px] rounded-[2px]"
                      style={{ background: COLORS.donut[i % COLORS.donut.length] }}
                    />
                    <span className="flex-1 text-[#64748b]">{s.label}</span>
                    <strong className="font-bold">{fmtPercent(s.value)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        {/* -------------------------------- ABAS ------------------------------- */}
        <nav
          aria-label="Indicadores"
          className="relative mt-10 grid grid-cols-4 before:absolute before:inset-x-0 before:top-[18px] before:h-px before:bg-[#e5e7eb] before:content-['']"
        >
          {METRICS.map((m) => {
            const Icon = m.icon;
            const active = m.id === metricId;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => setMetricId(m.id)}
                className={`group relative flex cursor-pointer flex-col items-center gap-2.5 border-0 bg-transparent p-0 text-[11px] ${
                  active ? 'font-semibold text-[#0f172a]' : 'text-[#64748b]'
                } ${FOCUS}`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full border transition-[border-color,color,background-color] duration-150 motion-reduce:transition-none ${
                    active
                      ? 'border-[#2563eb] bg-[#2563eb] text-white'
                      : 'border-[#e5e7eb] bg-white text-[#0f172a] group-hover:border-[#94a3b8]'
                  }`}
                >
                  <Icon size={16} />
                </span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* --------------------- LISTA DE PRODUTOS + INDICADORES --------------------- */}
        <section className="mt-[30px] grid grid-cols-[1fr_1px_340px] gap-x-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[28px]">
          <div>
            <h2 className="text-xs font-bold">Performance por Produto</h2>

            {/* [BACKEND] Uma linha para cada produto cadastrado */}
            <ul className="mt-2.5 grid gap-0.5">
              {view.rows.map((r) => {
                const hit = isHit(r.value);
                const selected = selectedId === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleProduct(r.id)}
                      className={`-mx-1.5 flex w-full cursor-pointer items-center gap-[14px] rounded-md border-0 px-1.5 py-[3px] text-left text-[10px] transition-colors duration-100 ${
                        selected ? 'bg-[#eff6ff]' : 'bg-transparent hover:bg-[#f8fafc]'
                      } ${FOCUS}`}
                    >
                      <span className="w-14 shrink-0 text-[#64748b]">{r.name}</span>
                      <span className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span
                          className="h-3 max-w-[calc(100%-96px)] shrink-0 rounded-[4px] transition-[width] duration-[250ms] ease-[ease] motion-reduce:transition-none"
                          style={{
                            width: `${Math.max(2, Math.min(100, (r.value / view.scaleMax) * 100))}%`,
                            background: hit ? COLORS.hit : COLORS.miss,
                          }}
                          title={fmtPercent(r.value)}
                        />
                        <span className="shrink-0 whitespace-nowrap font-semibold text-[#0f172a]">
                          {hit ? 'Meta Atingida' : 'Abaixo da Meta'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Divisória vertical */}
          <div aria-hidden="true" className="bg-[#e5e7eb] max-[900px]:hidden" />

          <aside className="flex flex-col justify-center gap-5 pl-2 max-[900px]:pl-0">
            <div className="flex items-center justify-between text-[11px] text-[#64748b]">
              <span>{view.product ? view.product.name /* [BACKEND] */ : 'Média geral'}</span>
              {view.product && (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className={`cursor-pointer border-0 bg-transparent p-0 text-[11px] text-[#2563eb] ${FOCUS}`}
                >
                  Limpar seleção
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
              {/* [BACKEND] Todos os valores abaixo vêm de `view.summary` / `view.value` */}
              <Kpi label="Itens" value={fmtNumber(view.summary.items)} />
              <Kpi label="Investimento total" value={fmtCurrency(view.summary.investment)} />
              <Kpi label="Lucro total" value={fmtCurrency(view.summary.profit)} />
              <Kpi label={metric.label} value={fmtPercent(view.value)} />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.02em] text-[#64748b]">{label}</span>
      <strong className="text-xl font-bold tracking-[-0.02em]">{value}</strong>
    </div>
  );
}