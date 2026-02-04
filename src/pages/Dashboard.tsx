import React, { useEffect, useState } from 'react';
import { getBudgets } from '../services/firestore';
import { Budget, BudgetStatus } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { formatCurrency } from '../utils/format';
import { CalendarCheck, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    pending: 0,
    currentMonthRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const budgets = await getBudgets();
      const now = new Date();
      
      let scheduled = 0;
      let completed = 0;
      let pending = 0;
      let revenue = 0;

      budgets.forEach(b => {
        if (b.status === BudgetStatus.SCHEDULED) scheduled++;
        if (b.status === BudgetStatus.COMPLETED) {
          completed++;
          const date = new Date(b.eventDate);
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            revenue += b.totalSales;
          }
        }
        if (b.status === BudgetStatus.DRAFT) pending++;
      });

      setStats({ scheduled, completed, pending, currentMonthRevenue: revenue });
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          <Icon size={24} className={`text-${color.replace('bg-', '')}`} />
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
        <StatCard 
          title="Eventos Agendados" 
          value={stats.scheduled} 
          icon={CalendarCheck} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Eventos Realizados" 
          value={stats.completed} 
          icon={TrendingUp} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Orçamentos Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-yellow-100 text-yellow-600" 
        />
         <StatCard 
          title="Receita (Mês Atual)" 
          value={formatCurrency(stats.currentMonthRevenue)} 
          icon={AlertCircle} 
          color="bg-indigo-100 text-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-64 flex items-center justify-center">
            <p className="text-slate-400">Gráfico de Receita vs Despesa (Em breve)</p>
        </Card>
      </div>
    </div>
  );
};