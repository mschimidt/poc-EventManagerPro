import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getSettings, getFixedCosts, saveBudget, getBudgetById 
} from '../services/firestore';
import { Budget, BudgetItem, BudgetStatus, FixedCost } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';
import { Trash2, Plus, Calculator, Copy } from 'lucide-react';

export const BudgetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Form Data
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<string>('');
  const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.DRAFT);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [desiredMargin, setDesiredMargin] = useState('20');

  // System Data for Calculation
  const [allFixedCosts, setAllFixedCosts] = useState<FixedCost[]>([]);
  const [settings, setSettings] = useState({ occupancyRate: 70, workingDaysPerMonth: 22 });

  // Calculation Results
  const [financials, setFinancials] = useState({
    fixedCostShare: 0,
    eventItemsCost: 0,
    totalEventCost: 0,
    sellingPrice: 0,
    netProfit: 0,
    relevantFixedSum: 0
  });

  useEffect(() => {
    const init = async () => {
      const [allFixed, sysSettings] = await Promise.all([
        getFixedCosts(),
        getSettings()
      ]);

      setAllFixedCosts(allFixed);
      setSettings(sysSettings);

      if (id) {
        const existing = await getBudgetById(id);
        if (existing) {
          setClientName(existing.clientName);
          setClientPhone(existing.clientPhone);
          setEventName(existing.eventName);
          setEventDate(existing.eventDate);
          setGuestCount(existing.guestCount ? String(existing.guestCount) : '');
          setStatus(existing.status);
          setItems(existing.items);
          setDesiredMargin(String(existing.marginPercent || '20'));
        }
      }
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    // Determine Relevant Fixed Costs
    let sumRelevantFixed = 0;
    if (eventDate) {
      const eventYearMonth = eventDate.substring(0, 7);
      const relevantCosts = allFixedCosts.filter(fc => !fc.monthYear || fc.monthYear === eventYearMonth);
      sumRelevantFixed = relevantCosts.reduce((acc, curr) => acc + curr.amount, 0);
    } else {
      sumRelevantFixed = allFixedCosts.filter(fc => !fc.monthYear).reduce((acc, curr) => acc + curr.amount, 0);
    }

    // Calculate Overhead Share
    const expectedEventsPerMonth = settings.workingDaysPerMonth * (settings.occupancyRate / 100);
    const fixedCostShare = expectedEventsPerMonth > 0 ? sumRelevantFixed / expectedEventsPerMonth : 0;

    // Sum Event Items Cost
    const eventItemsCost = items.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);

    // Total Cost
    const totalEventCost = fixedCostShare + eventItemsCost;

    // Calculate Selling Price based on Margin
    const marginValue = parseFloat(desiredMargin) || 0;
    let sellingPrice = 0;
    if (marginValue < 100) {
      sellingPrice = totalEventCost / (1 - marginValue / 100);
    } else {
      sellingPrice = totalEventCost; // Or some other handling for 100% margin
    }

    const netProfit = sellingPrice - totalEventCost;

    setFinancials({
      fixedCostShare,
      eventItemsCost,
      totalEventCost,
      sellingPrice,
      netProfit,
      relevantFixedSum: sumRelevantFixed
    });

  }, [items, allFixedCosts, settings, eventDate, desiredMargin]);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unitCost: 0,
    };
    setItems([...items, newItem]);
  };

  const duplicateItem = (index: number) => {
    const itemToCopy = items[index];
    const newItem = { ...itemToCopy, id: crypto.randomUUID() };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
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
      guestCount: Number(guestCount) || 0,
      status,
      items,
      totalFixedCostShare: financials.fixedCostShare,
      totalVariableCost: financials.eventItemsCost,
      totalSales: financials.sellingPrice,
      netProfit: financials.netProfit,
      marginPercent: Number(desiredMargin),
      createdAt: Date.now()
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Dados do Evento" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
              <Input label="Telefone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              <Input label="Nome do Evento" value={eventName} onChange={e => setEventName(e.target.value)} />
              <Input label="Data" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <Input label="Quantidade de Pessoas" type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
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
              title="Itens de Custo do Evento" 
              action={<Button size="sm" onClick={addItem}><Plus size={16} className="mr-2"/>Adicionar Item</Button>}
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
                        <th className="text-left py-2 w-32 font-medium text-slate-500">Custo Unit.</th>
                        <th className="text-right py-2 w-32 font-medium text-slate-500">Custo Total</th>
                        <th className="w-20 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-1">
                            <input type="text" placeholder="Nome do item" className="w-full border rounded px-2 py-1" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} />
                          </td>
                          <td className="py-1">
                            <input type="number" min="1" className="w-16 border rounded px-2 py-1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                          </td>
                          <td className="py-1">
                             <input type="number" className="w-24 border rounded px-2 py-1" value={item.unitCost} onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))} />
                          </td>
                          <td className="py-1 text-right font-medium">{formatCurrency(item.quantity * item.unitCost)}</td>
                          <td className="py-1 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button onClick={() => duplicateItem(idx)} className="text-blue-500 hover:text-blue-700" title="Duplicar"><Copy size={16} /></button>
                              <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700" title="Excluir"><Trash2 size={16} /></button>
                            </div>
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

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader title="Resumo Financeiro" icon={<Calculator />} />
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rateio Custos Fixos:</span>
                <span className="font-medium text-slate-700">{formatCurrency(financials.fixedCostShare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Custos do Evento (Itens):</span>
                <span className="font-medium text-slate-700">{formatCurrency(financials.eventItemsCost)}</span>
              </div>
              
              <div className="border-t border-slate-200 my-2"></div>

              <div className="flex justify-between items-center text-base bg-slate-50 p-3 rounded-md">
                <span className="font-semibold text-slate-900">Custo Total do Evento:</span>
                <span className="font-bold text-red-600">{formatCurrency(financials.totalEventCost)}</span>
              </div>

              <div className="border-t border-slate-200 my-2"></div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Margem de Lucro Líquido Desejada</label>
                <div className="flex items-center">
                  <Input 
                    type="number"
                    value={desiredMargin}
                    onChange={(e) => setDesiredMargin(e.target.value)}
                    className="flex-1"
                  />
                  <span className="ml-2 text-lg font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="border-t border-slate-200 my-2"></div>
              
              <div className="flex flex-col items-center text-center bg-green-50 p-4 rounded-md">
                <span className="text-sm font-semibold text-green-800">Valor de Venda do Evento</span>
                <span className="text-3xl font-bold text-green-700 mt-1">
                  {formatCurrency(financials.sellingPrice)}
                </span>
                <span className="text-xs text-green-600 mt-2">
                  Lucro líquido estimado: {formatCurrency(financials.netProfit)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
