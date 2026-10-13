import React, { useMemo, useState } from 'react';
import { Order } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Award,
  ShoppingBag,
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DailyRevenueChartProps {
  orders: Order[];
}

interface DailyData {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // "Seg 07/10" or "Hoje"
  shortDate: string; // "07/10"
  fullDate: string; // "Segunda-feira, 07 de outubro"
  isToday: boolean;
  revenue: number; // total R$
  orderCount: number; // quantity of orders
  averageTicket: number; // ticket médio
}

export const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ orders }) => {
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Calculate the 7 days array (from 6 days ago up to today)
  const chartData = useMemo<DailyData[]>(() => {
    const days: DailyData[] = [];
    const now = new Date();

    // Days of week in Portuguese
    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthsFull = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const isToday = i === 0;
      const isYesterday = i === 1;

      let dayLabel = `${weekDaysShort[d.getDay()]} ${day}/${month}`;
      if (isToday) dayLabel = 'Hoje';
      else if (isYesterday) dayLabel = 'Ontem';

      const shortDate = `${day}/${month}`;
      const fullDate = `${day} de ${monthsFull[d.getMonth()]}`;

      // Filter orders on this calendar day
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const oYear = orderDate.getFullYear();
        const oMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
        const oDay = String(orderDate.getDate()).padStart(2, '0');
        const oKey = `${oYear}-${oMonth}-${oDay}`;
        return oKey === dateKey;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const dayCount = dayOrders.length;
      const avgTicket = dayCount > 0 ? dayRevenue / dayCount : 0;

      days.push({
        dateKey,
        dayLabel,
        shortDate,
        fullDate,
        isToday,
        revenue: Math.round(dayRevenue * 100) / 100,
        orderCount: dayCount,
        averageTicket: Math.round(avgTicket * 100) / 100
      });
    }

    return days;
  }, [orders]);

  // Aggregate statistics for the 7-day period
  const total7DaysRevenue = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.revenue, 0);
  }, [chartData]);

  const total7DaysOrders = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.orderCount, 0);
  }, [chartData]);

  const dailyAverageRevenue = useMemo(() => {
    return total7DaysRevenue / 7;
  }, [total7DaysRevenue]);

  const bestDay = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.revenue - a.revenue)[0];
  }, [chartData]);

  // Format currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyData = payload[0].payload;
      return (
        <div className="bg-[#0f1d3b] border border-amber-500/40 rounded-xl p-3.5 shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {data.fullDate}
            </span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-extrabold">
                HOJE
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-zinc-400">Faturamento:</span>
            <span className="font-extrabold text-amber-400 text-sm">
              {formatCurrency(data.revenue)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Total de Pedidos:</span>
            <span className="font-bold text-white">{data.orderCount} pedido(s)</span>
          </div>

          {data.orderCount > 0 && (
            <div className="flex items-center justify-between text-[11px] border-t border-zinc-800/80 pt-1 text-zinc-400">
              <span>Ticket Médio:</span>
              <span className="text-emerald-400 font-semibold">
                {formatCurrency(data.averageTicket)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f1d3b] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl mb-6 space-y-4 sm:space-y-5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
              Faturamento Diário dos Últimos 7 Dias
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden md:inline-block">
              Recharts
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
            Volume financeiro diário e desempenho de vendas por dia.
          </p>
        </div>

        {/* Controls: View mode toggle & Collapse */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          {isExpanded && (
            <div className="flex items-center gap-1 bg-[#0f1d3b] p-1 rounded-xl border border-zinc-800 flex-1 sm:flex-initial justify-center">
              <button
                onClick={() => setMetricView('revenue')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  metricView === 'revenue'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Faturamento (R$)</span>
              </button>
              <button
                onClick={() => setMetricView('orders')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  metricView === 'orders'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Pedidos (Qtd)</span>
              </button>
            </div>
          )}

          {!isExpanded && (
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
              Total 7D: {formatCurrency(total7DaysRevenue)}
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-zinc-400 hover:text-white bg-[#0f1d3b] hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors shrink-0"
            title={isExpanded ? 'Recolher gráfico' : 'Expandir gráfico'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* KPI Highlight Strip for 7-Day Window */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#142a52] border border-zinc-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                Receita (7 Dias)
              </span>
              <div className="text-sm sm:text-lg font-black text-white mt-0.5 tabular-nums truncate">
                {formatCurrency(total7DaysRevenue)}
              </div>
              <span className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-semibold truncate">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> {total7DaysOrders} pedidos
              </span>
            </div>

            <div className="bg-[#142a52] border border-zinc-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                Média Diária
              </span>
              <div className="text-sm sm:text-lg font-black text-amber-300 mt-0.5 tabular-nums truncate">
                {formatCurrency(dailyAverageRevenue)}
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
                Base: 7 dias contínuos
              </span>
            </div>

            <div className="bg-[#142a52] border border-zinc-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                Melhor Dia
              </span>
              <div className="text-sm sm:text-lg font-black text-white mt-0.5 tabular-nums truncate">
                {bestDay && bestDay.revenue > 0 ? formatCurrency(bestDay.revenue) : 'R$ 0,00'}
              </div>
              <span className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1 font-semibold truncate">
                <Award className="w-3 h-3 shrink-0" />
                {bestDay && bestDay.revenue > 0 ? `${bestDay.dayLabel}` : 'Nenhum'}
              </span>
            </div>

            <div className="bg-[#142a52] border border-zinc-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                Faturamento Hoje
              </span>
              <div className="text-sm sm:text-lg font-black text-amber-400 mt-0.5 tabular-nums truncate">
                {formatCurrency(chartData[chartData.length - 1]?.revenue || 0)}
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">
                {chartData[chartData.length - 1]?.orderCount || 0} pedido(s)
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart Area */}
          <div className="w-full h-64 sm:h-76 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 6, left: -16, bottom: 15 }}
                onMouseMove={(state: any) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setHoveredIndex(state.activeTooltipIndex);
                  } else {
                    setHoveredIndex(null);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="todayBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#b45309" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="ordersBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />

                <XAxis
                  dataKey="dayLabel"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  dy={6}
                />

                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => {
                    if (metricView === 'orders') return `${val}`;
                    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
                    return `R$ ${val}`;
                  }}
                  width={56}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)', radius: 6 }}
                />

            <Bar
              dataKey={metricView === 'revenue' ? 'revenue' : 'orderCount'}
              radius={[8, 8, 2, 2]}
              maxBarSize={56}
              animationDuration={800}
            >
              {chartData.map((entry, index) => {
                const isCurrent = entry.isToday;
                const isHovered = hoveredIndex === index;

                let fill = metricView === 'revenue'
                  ? isCurrent
                    ? 'url(#todayBarGrad)'
                    : 'url(#revenueBarGrad)'
                  : 'url(#ordersBarGrad)';

                return (
                  <Cell
                    key={`cell-${entry.dateKey}`}
                    fill={fill}
                    stroke={isCurrent ? '#f59e0b' : isHovered ? '#fef08a' : 'transparent'}
                    strokeWidth={isCurrent ? 2 : isHovered ? 1.5 : 0}
                    className="transition-all duration-200 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Quick Tips footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-t from-amber-600 to-amber-400 inline-block" />
            <span>Dias Anteriores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 border border-amber-300 inline-block" />
            <span className="font-semibold text-zinc-200">Hoje (Em andamento)</span>
          </div>
        </div>

        <div className="text-zinc-500 italic flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Valores atualizados em tempo real a cada novo pedido na fila.</span>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
