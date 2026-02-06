import React, { useEffect, useState } from 'react';
import { 
  getCosts, addCost, deleteCost,
  getSettings, saveSettings,
  getDefaultItems, addDefaultItem, deleteDefaultItem
} from '../services/firestore';
import { Cost, SystemSettings, DefaultItem } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2, ChevronDown, PackagePlus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const DefaultItemsManager: React.FC<{
  items: DefaultItem[];
  onAdd: (item: DefaultItem) => void;
  onDelete: (id: string) => void;
}> = ({ items, onAdd, onDelete }) => {
  const [newItem, setNewItem] = useState({ name: '', unitCost: '' });

  const handleAdd = () => {
    if (!newItem.name || !newItem.unitCost) return;
    onAdd({
      name: newItem.name,
      unitCost: Number(newItem.unitCost)
    });
    setNewItem({ name: '', unitCost: '' });
  };

  return (
    <Card>
      <CardHeader title="Itens de Orçamento Padrão" icon={<PackagePlus />} />
      <CardContent>
        <p className="text-sm text-slate-500 mb-4">
          Cadastre itens que são frequentemente utilizados nos orçamentos para agilizar o preenchimento.
        </p>
        <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap p-4 bg-slate-50 rounded-lg border">
          <Input 
            label="Nome do Item" 
            value={newItem.name} 
            onChange={e => setNewItem({...newItem, name: e.target.value})} 
            className="flex-1 min-w-[200px]" 
          />
          <Input 
            label="Custo Unit. Padrão (R$)" 
            type="number" 
            value={newItem.unitCost} 
            onChange={e => setNewItem({...newItem, unitCost: e.target.value})} 
            className="md:w-40" 
          />
          <Button onClick={handleAdd}>Adicionar</Button>
        </div>

        <div className="border rounded-md overflow-hidden">
           <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Custo Padrão</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
               {items.length > 0 ? items.map(item => (
                 <tr key={item.id}>
                   <td className="px-6 py-3 text-sm text-slate-900">{item.name}</td>
                   <td className="px-6 py-3 text-sm text-slate-900">{formatCurrency(item.unitCost)}</td>
                   <td className="px-6 py-3 text-right w-16">
                     <button onClick={() => onDelete(item.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                   </td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Nenhum item padrão cadastrado.</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </CardContent>
    </Card>
  );
};

const CostSection: React.FC<{
  title: string;
  costs: Cost[];
  type: 'fixed' | 'variable';
  onAdd: (cost: Omit<Cost, 'id'>) => void;
  onDelete: (id: string) => void;
}> = ({ title, costs, type, onAdd, onDelete }) => {
  const [groupedCosts, setGroupedCosts] = useState<Record<string, Cost[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [newCost, setNewCost] = useState({ name: '', amount: '', monthYear: currentMonth });

  useEffect(() => {
    const groups: Record<string, Cost[]> = {};
    costs.forEach(cost => {
      const key = cost.monthYear || 'recorrente';
      if (!groups[key]) groups[key] = [];
      groups[key].push(cost);
    });
    setGroupedCosts(groups);
  }, [costs]);

  const handleAdd = () => {
    if (!newCost.name || !newCost.amount) return;
    onAdd({
      name: newCost.name,
      amount: Number(newCost.amount),
      monthYear: newCost.monthYear,
      type
    });
    setNewCost(prev => ({ ...prev, name: '', amount: '' }));
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
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap p-4 bg-slate-50 rounded-lg border">
          <Input label="Mês/Ano (opcional)" type="month" value={newCost.monthYear} onChange={e => setNewCost({...newCost, monthYear: e.target.value})} className="md:w-56" />
          <Input label="Nome do Custo" value={newCost.name} onChange={e => setNewCost({...newCost, name: e.target.value})} className="flex-1 min-w-[200px]" />
          <Input label="Valor (R$)" type="number" value={newCost.amount} onChange={e => setNewCost({...newCost, amount: e.target.value})} className="md:w-32" />
          <Button onClick={handleAdd}>Adicionar</Button>
        </div>
        
        <div className="space-y-2">
          {Object.keys(groupedCosts).length > 0 ? Object.keys(groupedCosts).map(groupKey => (
            <div key={groupKey} className="border rounded-md overflow-hidden">
              <button onClick={() => toggleGroup(groupKey)} className="w-full flex justify-between items-center px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                <h4 className="font-medium text-slate-700 capitalize">{formatMonthYear(groupKey)}</h4>
                <ChevronDown size={20} className={`transition-transform ${expandedGroups[groupKey] ? 'rotate-180' : ''}`} />
              </button>
              {expandedGroups[groupKey] && (
                <table className="min-w-full divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    {groupedCosts[groupKey].map(cost => (
                      <tr key={cost.id}>
                        <td className="px-6 py-3 text-sm text-slate-900">{cost.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-900">{formatCurrency(cost.amount)}</td>
                        <td className="px-6 py-3 text-right w-16">
                          <button onClick={() => onDelete(cost.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )) : <p className="text-center py-4 text-slate-500">Nenhum custo cadastrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export const Costs: React.FC = () => {
  const [allCosts, setAllCosts] = useState<Cost[]>([]);
  const [defaultItems, setDefaultItems] = useState<DefaultItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ occupancyRate: 70, workingDaysPerMonth: 22 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [costs, items, st] = await Promise.all([getCosts(), getDefaultItems(), getSettings()]);
    const sortedCosts = costs.sort((a, b) => (b.monthYear || '').localeCompare(a.monthYear || ''));
    setAllCosts(sortedCosts);
    setDefaultItems(items);
    setSettings(st);
  };

  const handleAddCost = async (cost: Omit<Cost, 'id'>) => {
    await addCost(cost as Cost);
    loadData();
  };
  
  const handleDeleteCost = async (id: string) => {
    await deleteCost(id);
    loadData();
  };

  const handleAddDefaultItem = async (item: DefaultItem) => {
    await addDefaultItem(item);
    loadData();
  };

  const handleDeleteDefaultItem = async (id: string) => {
    await deleteDefaultItem(id);
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    alert('Configurações salvas!');
  };

  const fixedCosts = allCosts.filter(c => c.type === 'fixed');
  const variableCosts = allCosts.filter(c => c.type === 'variable');

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Gestão de Custos e Parâmetros</h2>

      <Card>
        <CardHeader title="Parâmetros Gerais do Negócio" action={<Button onClick={handleSaveSettings} size="sm">Salvar Parâmetros</Button>} />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ocupação Esperada (%)" type="number" value={settings.occupancyRate} onChange={e => setSettings({...settings, occupancyRate: Number(e.target.value)})} />
          <Input label="Dias Úteis por Mês" type="number" value={settings.workingDaysPerMonth} onChange={e => setSettings({...settings, workingDaysPerMonth: Number(e.target.value)})} />
        </CardContent>
      </Card>
      
      <DefaultItemsManager 
        items={defaultItems}
        onAdd={handleAddDefaultItem}
        onDelete={handleDeleteDefaultItem}
      />

      <CostSection title="Custos Fixos Mensais" costs={fixedCosts} type="fixed" onAdd={handleAddCost} onDelete={handleDeleteCost} />
      <CostSection title="Custos Variáveis Históricos (Não vinculados a orçamentos)" costs={variableCosts} type="variable" onAdd={handleAddCost} onDelete={handleDeleteCost} />
    </div>
  );
};