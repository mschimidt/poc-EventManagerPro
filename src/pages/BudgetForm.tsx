import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getSettings, getFixedCosts, getVariableItems, saveBudget, getBudgetById 
} from '../services/firestore';
import { Budget, BudgetItem, BudgetStatus, VariableCostItem } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatPercent } from '../utils/format';
import { Trash2, Plus, Calculator } from 'lucide-react';

export const BudgetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Form Data
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.DRAFT);
  const [items, setItems] = useState<BudgetItem[]>([]);

  // System Data for Calculation
  const [catalog, setCatalog] = useState<VariableCostItem[]>([]);
  const [fixedCostsSum, setFixedCostsSum] = useState(0);
  const [settings, setSettings] = useState({ occupancyRate: 70, workingDaysPerMonth: 22 });

  // Calculation Results
  const [financials, setFinancials] = useState({
    fixedCostShare: 0,
    totalVariable: 0,
    totalSales: 0,
    netProfit: 0,
    margin: 0
  });

  useEffect(() => {
    const init = async () => {
      // 1. Load System Data
      const [allFixed, allCatalog, sysSettings] = await Promise.all([
        getFixedCosts(),
        getVariableItems(),
        getSettings()
      ]);

      const sumFixed = allFixed.reduce((acc, curr) => acc + curr.amount, 0);
      setFixedCostsSum(sumFixed);
      setCatalog(allCatalog);
      setSettings(sysSettings);

      // 2. Load Budget if Edit Mode
      if (id) {
        const existing = await getBudgetById(id);
        if (existing) {
          setClientName(existing.clientName);
          setClientPhone(existing.clientPhone);
          setEventName(existing.eventName);
          setEventDate(existing.eventDate);
          setStatus(existing.status);
          setItems(existing.items);
        }
      }
      setLoading(false);
    };
    init();
  }, [id]);

  // Recalculate whenever items or system settings change
  useEffect(() => {
    // 1. Calculate Overhead Share
    // Formula: Total Fixed / (Days * (Occupancy/100))
    const expectedEventsPerMonth = settings.workingDaysPerMonth * (settings.occupancyRate / 100);
    const overheadPerEvent = expectedEventsPerMonth > 0 ? fixedCostsSum / expectedEventsPerMonth : 0;

    // 2. Sum Items
    let totalVar = 0;
    let totalSale = 0;

    items.forEach(item => {
      totalVar += item.unitCost * item.quantity;
      totalSale += item.unitPrice * item.quantity;
    });

    const profit = totalSale - totalVar - overheadPerEvent;
    const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;

    setFinancials({
      fixedCostShare: overheadPerEvent,
      totalVariable: totalVar,
      totalSales: totalSale,
      netProfit: profit,
      margin: margin
    });

  }, [items, fixedCostsSum, settings]);

  const addItem = (catalogItem: VariableCostItem) => {
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      name: catalogItem.name,
      quantity: 1,
      unitCost: catalogItem.defaultUnitCost,
      unitPrice: catalogItem.defaultUnitPrice
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clientName || !eventName || !eventDate) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const budget: Budget = {
      id,
      clientName,
      clientPhone,
      eventName,
      eventDate,
      status,
      items,
      totalFixedCostShare: financials.fixedCostShare,
      totalVariableCost: financials.totalVariable,
      totalSales: financials.totalSales,
      netProfit: financials.netProfit,
      marginPercent: financials.margin,
      createdAt: Date.now() // placeholder, updated in service
    };

    await saveBudget(budget);
    navigate('/budgets');
  };

  if (loading) return <div className="text-center p-10">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">{id ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>
        <div className="space-x-2">
            <Button variant="secondary" onClick={() => navigate('/budgets')}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Orçamento</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Dados do Evento" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
              <Input label="Telefone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              <Input label="Nome do Evento" value={eventName} onChange={e => setEventName(e.target.value)} />
              <Input label="Data" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 px-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BudgetStatus)}
                >
                  {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader 
              title="Itens do Orçamento" 
              action={
                <select 
                  className="text-sm border-slate-300 rounded-md shadow-sm"
                  onChange={(e) => {
                    const item = catalog.find(c => c.id === e.target.value);
                    if (item) addItem(item);
                    e.target.value = '';
                  }}
                >
                  <option value="">+ Adicionar do Catálogo</option>
                  {catalog.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              }
            />
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Nenhum item adicionado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-medium text-slate-500">Item</th>
                        <th className="text-left py-2 w-20 font-medium text-slate-500">Qtd</th>
                        <th className="text-left py-2 w-32 font-medium text-slate-500">Preço Venda</th>
                        <th className="text-right py-2 w-32 font-medium text-slate-500">Subtotal</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">
                            <input 
                              type="number" min="1"
                              className="w-16 border rounded px-1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-2">
                             <input 
                              type="number"
                              className="w-24 border rounded px-1"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                          <td className="py-2 text-right">
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Calculations */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader title="Resumo Financeiro" icon={<Calculator />} />
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Venda (Receita):</span>
                <span className="font-bold text-slate-900">{formatCurrency(financials.totalSales)}</span>
              </div>
              
              <div className="border-t border-slate-100 my-2"></div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">(-) Custos Variáveis:</span>
                <span className="text-red-600">{formatCurrency(financials.totalVariable)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">(-) Rateio Custos Fixos:</span>
                <span className="text-red-600">{formatCurrency(financials.fixedCostShare)}</span>
              </div>

              <div className="border-t border-slate-200 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Lucro Líquido:</span>
                <span className={`text-lg font-bold ${financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financials.netProfit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Margem (%):</span>
                <span className={`font-medium ${financials.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(financials.margin)}
                </span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md mt-4 text-xs text-blue-700">
                <p><strong>Cálculo do Rateio:</strong></p>
                <p>Custos Fixos Totais / (Dias Úteis * % Ocupação)</p>
                <p>{formatCurrency(fixedCostsSum)} / ({settings.workingDaysPerMonth} * {settings.occupancyRate}%)</p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};