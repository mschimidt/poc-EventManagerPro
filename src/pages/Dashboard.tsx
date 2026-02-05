import React, { useEffect, useState } from 'react';
import { getBudgets, getCosts } from '../services/firestore';
import { Budget, BudgetStatus, Cost } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { formatCurrency } from '../utils/format';
import { CalendarCheck, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Calendar } from '../components/Calendar';
import { BarChart } from '../components/BarChart';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    pending: 0,
    currentMonthRevenue: 0
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [budgetsData, costsData] = await Promise.all([getBudgets(), getCosts()]);
      setBudgets(budgetsData);
      processDashboardData(budgetsData, costsData);
    };

    fetchData();
  }, []);

  const processDashboardData = (allBudgets: Budget[], allCosts: Cost[]) => {
    const now = new Date();
    
    // Stats Cards
    let scheduled = 0, completed = 0, pending = 0, revenue = 0;
    allBudgets.forEach(b => {
      if (b.status === BudgetStatus.SCHEDULED) scheduled++;
      if (b.status === BudgetStatus.DRAFT) pending++;
      if (b.status === BudgetStatus.COMPLETED) {
        completed++;
        const eventDate = new Date(b.eventDate);
        if (eventDate.getUTCMonth() === now.getUTCMonth() && eventDate.getUTCFullYear() === now.getUTCFullYear()) {
          revenue += b.totalSales;
        }
      }
    });
    setStats({ scheduled, completed, pending, currentMonthRevenue: revenue });

    // Chart Data (last 6 months)
    const labels: string[] = [];
    const revenueData: number[] = [];
    const expenseData: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStr = d.toLocaleString('pt-BR', { month: 'short' });
      labels.push(monthStr.charAt(0).toUpperCase() + monthStr.slice(1));
      
      const monthYearStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      // Revenue for the month
      const monthRevenue = allBudgets
        .filter(b => {
          const eventDate = new Date(b.eventDate);
          return b.status === BudgetStatus.COMPLETED && 
                 eventDate.getUTCMonth() === month && 
                 eventDate.getUTCFullYear() === year;
        })
        .reduce((sum, b) => sum + b.totalSales, 0);
      revenueData.push(monthRevenue);

      // Expenses for the month
      const eventExpenses = allBudgets
        .filter(b => {
            const eventDate = new Date(b.eventDate);
            return b.status === BudgetStatus.COMPLETED && 
                   eventDate.getUTCMonth() === month && 
                   eventDate.getUTCFullYear() === year;
        })
        .reduce((sum, b) => sum + b.totalVariableCost, 0);
        
      const companyExpenses = allCosts
        .filter(c => !c.monthYear || c.monthYear === monthYearStr)
        .reduce((sum, c) => sum + c.amount, 0);
        
      expenseData.push(eventExpenses + companyExpenses);
    }
    
    setChartData({
      labels,
      datasets: [
        { label: 'Receita', data: revenueData, color: '#4f46e5' }, // indigo
        { label: 'Despesa', data: expenseData, color: '#ef4444' }, // red
      ]
    });
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Eventos Agendados" value={stats.scheduled} icon={CalendarCheck} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Eventos Realizados" value={stats.completed} icon={TrendingUp} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Orçamentos Pendentes" value={stats.pending} icon={Clock} colorClass="bg-yellow-100 text-yellow-600" />
        <StatCard title="Receita (Mês Atual)" value={formatCurrency(stats.currentMonthRevenue)} icon={AlertCircle} colorClass="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="Calendário de Eventos" />
            <CardContent>
              <Calendar events={budgets} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Receita vs. Despesa (Últimos 6 Meses)" />
            <CardContent>
              {chartData ? (
                <BarChart data={chartData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">Carregando gráfico...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
