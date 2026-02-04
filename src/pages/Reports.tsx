import React, { useEffect, useState } from 'react';
import { getBudgets, getFixedCosts } from '../services/firestore';
import { Budget, BudgetStatus } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { formatCurrency, formatPercent } from '../utils/format';
import { PieChart, DollarSign } from 'lucide-react';

export const Reports: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [fixedCostTotal, setFixedCostTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [report, setReport] = useState({
    totalRevenue: 0,
    totalVariableCosts: 0,
    actualFixedCosts: 0,
    grossProfit: 0,
    netResult: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const [bData, fcData] = await Promise.all([getBudgets(), getFixedCosts()]);
      setBudgets(bData);
      setFixedCostTotal(fcData.reduce((acc, curr) => acc + curr.amount, 0));
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Filter Completed budgets for selected month/year
    const relevantBudgets = budgets.filter(b => {
      const d = new Date(b.eventDate);
      return b.status === BudgetStatus.COMPLETED && 
             d.getMonth() === selectedMonth && 
             d.getFullYear() === selectedYear;
    });

    const totalRevenue = relevantBudgets.reduce((acc, b) => acc + b.totalSales, 0);
    const totalVariableCosts = relevantBudgets.reduce((acc, b) => acc + b.totalVariableCost, 0);
    const grossProfit = totalRevenue - totalVariableCosts;
    const netResult = grossProfit - fixedCostTotal;

    setReport({
      totalRevenue,
      totalVariableCosts,
      actualFixedCosts: fixedCostTotal,
      grossProfit,
      netResult
    });

  }, [budgets, fixedCostTotal, selectedMonth, selectedYear]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Relatório Financeiro</h2>

      <div className="flex gap-4">
        <select 
          className="h-10 rounded-md border border-slate-300 px-3 bg-white"
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select 
          className="h-10 rounded-md border border-slate-300 px-3 bg-white"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="DRE Simplificado (Mês)" icon={<PieChart />} />
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-600">Receita Bruta (Eventos Realizados)</span>
              <span className="font-bold text-slate-900">{formatCurrency(report.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">(-) Custos Variáveis</span>
              <span className="text-red-500">{formatCurrency(report.totalVariableCosts)}</span>
            </div>
             <div className="border-t border-slate-100"></div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-700">(=) Lucro Bruto (Margem de Contribuição)</span>
              <span className="text-blue-600">{formatCurrency(report.grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">(-) Custos Fixos Mensais</span>
              <span className="text-red-500">{formatCurrency(report.actualFixedCosts)}</span>
            </div>
            <div className="border-t border-slate-200"></div>
            <div className="flex justify-between items-center text-lg font-bold bg-slate-50 p-3 rounded">
              <span className="text-slate-900">Resultado Líquido</span>
              <span className={report.netResult >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(report.netResult)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Análise de Indicadores" icon={<DollarSign />} />
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Margem Líquida (sobre receita)</p>
              <div className="text-2xl font-bold text-slate-800">
                {report.totalRevenue > 0 ? formatPercent((report.netResult / report.totalRevenue) * 100) : '0%'}
              </div>
              <p className="text-xs text-slate-400">Quanto sobra de cada R$ 1,00 vendido.</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Ponto de Equilíbrio (aprox.)</p>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(report.actualFixedCosts)}
              </div>
              <p className="text-xs text-slate-400">Receita mínima de contribuição necessária para cobrir custos fixos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};