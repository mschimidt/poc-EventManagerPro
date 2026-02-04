import React, { useEffect, useState } from 'react';
import { 
  getFixedCosts, addFixedCost, deleteFixedCost,
  getVariableItems, addVariableItem, deleteVariableItem,
  getSettings, saveSettings
} from '../services/firestore';
import { FixedCost, VariableCostItem, SystemSettings } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const Costs: React.FC = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [variableItems, setVariableItems] = useState<VariableCostItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ occupancyRate: 70, workingDaysPerMonth: 22 });
  
  // Forms state
  const [newFixed, setNewFixed] = useState({ name: '', amount: '' });
  const [newVariable, setNewVariable] = useState({ name: '', cost: '', price: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fc, vi, st] = await Promise.all([getFixedCosts(), getVariableItems(), getSettings()]);
    setFixedCosts(fc);
    setVariableItems(vi);
    setSettings(st);
  };

  const handleAddFixed = async () => {
    if (!newFixed.name || !newFixed.amount) return;
    await addFixedCost({ name: newFixed.name, amount: Number(newFixed.amount) });
    setNewFixed({ name: '', amount: '' });
    loadData();
  };

  const handleAddVariable = async () => {
    if (!newVariable.name || !newVariable.cost || !newVariable.price) return;
    await addVariableItem({
      name: newVariable.name,
      defaultUnitCost: Number(newVariable.cost),
      defaultUnitPrice: Number(newVariable.price)
    });
    setNewVariable({ name: '', cost: '', price: '' });
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    alert('Configurações salvas!');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Gestão de Custos e Parâmetros</h2>

      {/* Settings */}
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

      {/* Fixed Costs */}
      <Card>
        <CardHeader title="Custos Fixos Mensais" />
        <CardContent>
          <div className="flex gap-4 mb-4 items-end">
            <Input 
              label="Nome do Custo (ex: Aluguel)" 
              value={newFixed.name} 
              onChange={e => setNewFixed({...newFixed, name: e.target.value})}
              className="flex-1"
            />
            <Input 
              label="Valor (R$)" 
              type="number" 
              value={newFixed.amount} 
              onChange={e => setNewFixed({...newFixed, amount: e.target.value})}
              className="w-32"
            />
            <Button onClick={handleAddFixed}>Adicionar</Button>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {fixedCosts.map(fc => (
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
        </CardContent>
      </Card>

      {/* Variable Costs */}
      <Card>
        <CardHeader title="Itens de Custo Variável (Catálogo)" />
        <CardContent>
          <div className="flex gap-4 mb-4 items-end flex-wrap md:flex-nowrap">
            <Input 
              label="Item (ex: Buffet Premium)" 
              value={newVariable.name} 
              onChange={e => setNewVariable({...newVariable, name: e.target.value})}
              className="flex-grow"
            />
            <Input 
              label="Custo Interno (R$)" 
              type="number"
              value={newVariable.cost} 
              onChange={e => setNewVariable({...newVariable, cost: e.target.value})}
              className="w-32"
            />
            <Input 
              label="Preço Venda (R$)" 
              type="number"
              value={newVariable.price} 
              onChange={e => setNewVariable({...newVariable, price: e.target.value})}
              className="w-32"
            />
            <Button onClick={handleAddVariable}>Adicionar</Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Custo Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Preço Base</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {variableItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatCurrency(item.defaultUnitCost)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(item.defaultUnitPrice)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={async () => { await deleteVariableItem(item.id!); loadData(); }} className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};