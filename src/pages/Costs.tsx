import React, { useEffect, useState } from 'react';
import { 
  getFixedCosts, addFixedCost, deleteFixedCost,
  getSettings, saveSettings
} from '../services/firestore';
import { FixedCost, SystemSettings } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const Costs: React.FC = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ occupancyRate: 70, workingDaysPerMonth: 22 });
  
  // State for grouped and collapsible costs
  const [groupedCosts, setGroupedCosts] = useState<Record<string, FixedCost[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Form state
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [newFixed, setNewFixed] = useState({ name: '', amount: '', monthYear: currentMonth });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const groups: Record<string, FixedCost[]> = {};
    fixedCosts.forEach(cost => {
      const key = cost.monthYear || 'recorrente';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cost);
    });
    setGroupedCosts(groups);
  }, [fixedCosts]);

  const loadData = async () => {
    const [fc, st] = await Promise.all([getFixedCosts(), getSettings()]);
    const sortedFc = fc.sort((a, b) => (b.monthYear || '').localeCompare(a.monthYear || ''));
    setFixedCosts(sortedFc);
    setSettings(st);
  };

  const handleAddFixed = async () => {
    if (!newFixed.name || !newFixed.amount) return;
    
    await addFixedCost({ 
      name: newFixed.name, 
      amount: Number(newFixed.amount),
      monthYear: newFixed.monthYear 
    });
    
    setNewFixed(prev => ({ ...prev, name: '', amount: '' }));
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    alert('Configurações salvas!');
  };

  const formatMonthYear = (val?: string) => {
    if (!val || val === 'recorrente') return 'Custos Recorrentes';
    const [year, month] = val.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  
  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Gestão de Custos e Parâmetros</h2>

      <Card>
        <CardHeader title="Parâmetros Gerais do Negócio" 
          action={<Button onClick={handleSaveSettings} size="sm">Salvar Parâmetros</Button>} 
        />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Porcentagem de Ocupação Esperada (%)" 
            type="number" 
            value={settings.occupancyRate} 
            onChange={e => setSettings({...settings, occupancyRate: Number(e.target.value)})}
          />
          <Input 
            label="Dias Úteis por Mês" 
            type="number" 
            value={settings.workingDaysPerMonth} 
            onChange={e => setSettings({...settings, workingDaysPerMonth: Number(e.target.value)})}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Custos Fixos Mensais" />
        <CardContent>
          <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap p-4 bg-slate-50 rounded-lg border">
            <div className="w-full md:w-56 shrink-0">
              <Input 
                label="Mês/Ano (ou deixe em branco)" 
                type="month"
                value={newFixed.monthYear} 
                onChange={e => setNewFixed({...newFixed, monthYear: e.target.value})}
              />
            </div>
            <div className="w-full md:flex-1 min-w-[200px]">
              <Input 
                label="Nome do Custo (ex: Aluguel)" 
                value={newFixed.name} 
                onChange={e => setNewFixed({...newFixed, name: e.target.value})}
              />
            </div>
            <div className="w-full md:w-32 shrink-0">
              <Input 
                label="Valor (R$)" 
                type="number" 
                value={newFixed.amount} 
                onChange={e => setNewFixed({...newFixed, amount: e.target.value})}
              />
            </div>
            <Button onClick={handleAddFixed}>Adicionar</Button>
          </div>
          
          <div className="space-y-2">
            {Object.keys(groupedCosts).length > 0 ? Object.keys(groupedCosts).map(groupKey => (
              <div key={groupKey} className="border rounded-md overflow-hidden">
                <button 
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex justify-between items-center px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <h4 className="font-medium text-slate-700 capitalize">{formatMonthYear(groupKey)}</h4>
                  <ChevronDown size={20} className={`transition-transform ${expandedGroups[groupKey] ? 'rotate-180' : ''}`} />
                </button>
                {expandedGroups[groupKey] && (
                  <div className="bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                          <th className="px-6 py-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {groupedCosts[groupKey].map(fc => (
                          <tr key={fc.id}>
                            <td className="px-6 py-4 text-sm text-slate-900">{fc.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(fc.amount)}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={async () => { await deleteFixedCost(fc.id!); loadData(); }} className="text-red-600 hover:text-red-900">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )) : <p className="text-center py-4 text-slate-500">Nenhum custo cadastrado.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
