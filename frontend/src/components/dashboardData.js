/**
 * dashboardData.js
 * ---------------------------------------------------------------------------
 * ÚNICO ponto de contato do dashboard com o backend.
 *
 * [BACKEND] Hoje `fetchDashboardData` devolve dados FICTÍCIOS (veja a seção
 * "MOCK" no fim do arquivo). Quando o endpoint estiver pronto:
 *   1. Troque o corpo de `fetchDashboardData` por um fetch/axios real.
 *   2. Apague a seção MOCK inteira.
 *   3. Nada precisa mudar em Dashboard.jsx, desde que o formato abaixo seja mantido.
 *
 * FORMATO ESPERADO DA RESPOSTA (percentuais como número, ex.: 60 = 60%):
 *
 * {
 *   company: { name: string },
 *
 *   // Meta de cada métrica (define barra verde/vermelha na lista de produtos)
 *   goals: { custoPorVenda, margemLucro, markup, faixaMargem },
 *
 *   // Visão GERAL (nenhum produto selecionado) -> média de todos os produtos
 *   general: {
 *     metrics:   { custoPorVenda, margemLucro, markup, faixaMargem },
 *     summary:   { items, investment, profit },          // investment/profit em R$
 *     breakdown: { [metricId]: [{ label, value }] }      // fatias do gráfico de rosca
 *   },
 *
 *   // Lista de produtos cadastrados (um por linha na parte inferior)
 *   products: [{
 *     id, name,
 *     metrics:   { custoPorVenda, margemLucro, markup, faixaMargem },
 *     summary:   { items, investment, profit },
 *     breakdown: { [metricId]: [{ label, value }] }
 *   }]
 * }
 */

/** [BACKEND] Substituir pela chamada real à API. */
export async function fetchDashboardData() {
  // Exemplo:
  // const res = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
  // if (!res.ok) throw new Error('Falha ao carregar o dashboard');
  // return res.json();

  return buildMockData(); // <- remover junto com a seção MOCK
}

/* ===========================================================================
 * MOCK — APAGAR QUANDO O BACKEND ESTIVER PRONTO
 * Só existe para o layout aparecer preenchido durante o desenvolvimento.
 * ======================================================================== */

// [nome, custo unitário, preço de venda, estoque]
const MOCK_RAW = [
  ['Produto A', 50, 100, 12],
  ['Produto B', 75, 100, 30],
  ['Produto C', 55, 100, 8],
  ['Produto D', 80, 100, 25],
  ['Produto E', 60, 100, 15],
  ['Produto F', 85, 100, 20],
];

const bandOf = (margin) => (margin > 40 ? 0 : margin >= 20 ? 1 : 2); // Alta, Média, Baixa
const BAND_LABELS = ['Faixa Alta', 'Faixa Média', 'Faixa Baixa'];
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const avg = (arr) => sum(arr) / arr.length;

function mockBreakdown(metricId, value, bandCounts) {
  switch (metricId) {
    case 'custoPorVenda':
      return [
        { label: 'Custo do produto', value },
        { label: 'Despesas', value: 10 },
        { label: 'Lucro', value: Math.max(0, 90 - value) },
      ];
    case 'margemLucro':
      return [
        { label: 'Lucro', value },
        { label: 'Custo', value: 100 - value },
      ];
    case 'markup':
      return [
        { label: 'Custo', value: (100 / (100 + value)) * 100 },
        { label: 'Acréscimo', value: (value / (100 + value)) * 100 },
      ];
    default: // faixaMargem
      return BAND_LABELS.map((label, i) => ({ label, value: bandCounts[i] }));
  }
}

function buildMockData() {
  const products = MOCK_RAW.map(([name, cost, sale, stock], i) => {
    const margin = ((sale - cost) / sale) * 100;
    const metrics = {
      custoPorVenda: (cost / sale) * 100,
      margemLucro: margin,
      markup: ((sale - cost) / cost) * 100,
      faixaMargem: margin,
    };
    const bands = [0, 0, 0];
    bands[bandOf(margin)] = 100;
    return {
      id: `p${i + 1}`,
      name,
      metrics,
      summary: { items: stock, investment: cost * stock, profit: (sale - cost) * stock },
      breakdown: Object.fromEntries(
        Object.keys(metrics).map((m) => [m, mockBreakdown(m, metrics[m], bands)])
      ),
    };
  });

  const metricIds = ['custoPorVenda', 'margemLucro', 'markup', 'faixaMargem'];
  const generalMetrics = Object.fromEntries(
    metricIds.map((m) => [m, avg(products.map((p) => p.metrics[m]))])
  );
  const generalBands = [0, 1, 2].map(
    (b) => (products.filter((p) => bandOf(p.metrics.margemLucro) === b).length / products.length) * 100
  );

  return {
    company: { name: 'Empresa XYZ' },
    goals: { custoPorVenda: 60, margemLucro: 30, markup: 50, faixaMargem: 30 },
    general: {
      metrics: generalMetrics,
      summary: {
        items: sum(products.map((p) => p.summary.items)),
        investment: sum(products.map((p) => p.summary.investment)),
        profit: sum(products.map((p) => p.summary.profit)),
      },
      breakdown: Object.fromEntries(
        metricIds.map((m) => [m, mockBreakdown(m, generalMetrics[m], generalBands)])
      ),
    },
    products,
  };
}