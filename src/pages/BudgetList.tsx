import React, { useEffect, useState } from 'react';
import { getBudgets, updateBudgetStatus, deleteBudget } from '../services/firestore';
import { Budget, BudgetStatus } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { generateBudgetPDF } from '../utils/pdfGenerator';
import { formatCurrency, formatDate } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { FileDown, Edit, Trash2 } from 'lucide-react';

export const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filtered, setFiltered] = useState<Budget[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBudgets();
  }, []);

  useEffect(() => {
    let res = budgets;
    if (statusFilter) {
      res = res.filter(b => b.status === statusFilter);
    }
    if (search) {
      const lower = search.toLowerCase();
      res = res.filter(b => 
        b.clientName.toLowerCase().includes(lower) || 
        b.eventName.toLowerCase().includes(lower)
      );
    }
    setFiltered(res);
  }, [budgets, statusFilter, search]);

  const loadBudgets = async () => {
    const data = await getBudgets();
    // Sort by date descending
    data.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    setBudgets(data);
    setFiltered(data);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateBudgetStatus(id, newStatus);
    loadBudgets();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      await deleteBudget(id);
      loadBudgets();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BudgetStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case BudgetStatus.SCHEDULED: return 'bg-blue-100 text-blue-800';
      case BudgetStatus.DECLINED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Orçamentos</h2>
        <Button onClick={() => navigate('/budgets/new')}>+ Novo Orçamento</Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input 
                placeholder="Buscar por cliente ou evento..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="h-10 rounded-md border border-slate-300 px-3 bg-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Todos Status</option>
              {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente / Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filtered.map(budget => (
                  <tr key={budget.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(budget.eventDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{budget.clientName}</div>
                      <div className="text-sm text-slate-500">{budget.eventName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                        {budget.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {formatCurrency(budget.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/budgets/edit/${budget.id}`)}
                        className="text-indigo-600 hover:text-indigo-900" 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => generateBudgetPDF(budget)}
                        className="text-slate-600 hover:text-slate-900" 
                        title="Gerar PDF"
                      >
                        <FileDown size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(budget.id!)}
                        className="text-red-600 hover:text-red-900" 
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-6 text-slate-500">Nenhum orçamento encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};