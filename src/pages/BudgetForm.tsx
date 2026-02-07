import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getSettings, getCosts, saveBudget, getBudgetById, getDefaultItems 
} from '../services/firestore';
import { Budget, BudgetItem, BudgetStatus, Cost, DefaultItem } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';
import { Trash2, Plus, Calculator, Copy, ChevronDown, ListPlus } from 'lucide-react';

const formatPhone = (value: string) => {
  if (!value) return '';
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  value = value.replace(/(\d)(\d{4})$/, '$1-$2');
  return value;
};

export const BudgetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<string>('');
  const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.DRAFT);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [desiredMargin, setDesiredMargin] = useState('20');
  
  const [allCosts, setAllCosts] = useState<Cost[]>([]);
  const [settings, setSettings] = useState({ occupancyRate: 70, workingDaysPerMonth: 22 });
  const [defaultItems, setDefaultItems] = useState<DefaultItem[]>([]);
  
  const [showCalcMemory, setShowCalcMemory] = useState(false);
  const [financials, setFinancials] = useState({
    fixedCostShare: 0,
    eventItemsCost: 0,
    totalEventCost: 0,
    sellingPrice: 0,
    netProfit: 0,
    calc: { relevantFixed: 0, relevantVariable: 0, totalRelevant: 0 }
  });

  useEffect(() => {
    const init = async () => {
      const [all, sysSettings, dfltItems] = await Promise.all([getCosts(), getSettings(), getDefaultItems()]);
      setAllCosts(all);
      setSettings(sysSettings);
      setDefaultItems(dfltItems);

      if (id) {
        const existing = await getBudgetById(id);
        if (existing) {
          setClientName(existing.clientName);
          setClientPhone(existing.clientPhone);
          setEventName(existing.eventName);
          setEventLocation(existing.eventLocation);
          setEventDate(existing.eventDate);
          setGuestCount(String(existing.guestCount || ''));
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
    const eventYearMonth = eventDate.substring(0, 7);
    const relevantCosts = allCosts.filter(c => !c.monthYear || c.monthYear === eventYearMonth);
    
    const relevantFixed = relevantCosts.filter(c => c.type === 'fixed').reduce((s, c) => s + c.amount, 0);
    const relevantVariable = relevantCosts.filter(c => c.type === 'variable').reduce((s, c) => s + c.amount, 0);
    const totalRelevant = relevantFixed + relevantVariable;

    const expectedEvents = settings.workingDaysPerMonth * (settings.occupancyRate / 100);
    const fixedCostShare = expectedEvents > 0 ? totalRelevant / expectedEvents : 0;
    const eventItemsCost = items.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);
    const totalEventCost = fixedCostShare + eventItemsCost;
    
    const margin = parseFloat(desiredMargin) || 0;
    const sellingPrice = margin < 100 ? totalEventCost / (1 - margin / 100) : totalEventCost;
    const netProfit = sellingPrice - totalEventCost;

    setFinancials({
      fixedCostShare, eventItemsCost, totalEventCost, sellingPrice, netProfit,
      calc: { relevantFixed, relevantVariable, totalRelevant }
    });
  }, [items, allCosts, settings, eventDate, desiredMargin]);

  const addItem = () => setItems([...items, { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 }]);
  const duplicateItem = (index: number) => {
    const newItem = { ...items[index], id: crypto.randomUUID() };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };
  const updateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleLoadDefaultItems = () => {
    if (defaultItems.length === 0) {
      alert("Nenhum item padrão cadastrado. Vá para 'Custos & Config' para adicioná-los.");
      return;
    }
    const newItemsFromDefaults = defaultItems.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      unitCost: item.unitCost,
      quantity: 1,
    }));
    setItems(prev => [...prev, ...newItemsFromDefaults]);
  };

  const handleSave = async () => {
    if (!clientName || !eventName || !eventDate) {
      alert("Preencha os campos obrigatórios");
      return;
    }
    const budget: Budget = {
      id, clientName, eventName, eventDate, status, items,
      clientPhone: clientPhone.replace(/\D/g, ''),
      eventLocation,
      guestCount: Number(guestCount) || 0,
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
        <h2 className="text-2xl font-bold">{id ? 'Editar' : 'Novo'} Orçamento</h2>
        <div><Button variant="secondary" onClick={() => navigate('/budgets')}>Cancelar</Button><Button onClick={handleSave} className="ml-2">Salvar</Button></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Dados do Evento" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
              <Input label="Telefone" value={clientPhone} onChange={e => setClientPhone(formatPhone(e.target.value))} maxLength={15} />
              <Input label="Nome do Evento" value={eventName} onChange={e => setEventName(e.target.value)} />
              <Input label="Cidade - UF" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
              <Input label="Data" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <Input label="Qtd. de Pessoas" type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full h-10 rounded-md border px-3" value={status} onChange={e => setStatus(e.target.value as BudgetStatus)}>
                  {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader 
              title="Itens de Custo do Evento" 
              action={
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={handleLoadDefaultItems}><ListPlus size={16} className="mr-2"/>Carregar Padrão</Button>
                  <Button size="sm" onClick={addItem}><Plus size={16} className="mr-2"/>Adicionar Item</Button>
                </div>
              } 
            />
            <CardContent>
              {items.length === 0 ? <p className="text-center text-slate-500 py-4">Nenhum item.</p> : (
                <div className="overflow-x-auto"><table className="min-w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 font-medium">Item</th><th className="text-left py-2 w-20 font-medium">Qtd</th><th className="text-left py-2 w-32 font-medium">Custo Unit.</th><th className="text-right py-2 w-32 font-medium">Custo Total</th><th className="w-20 text-center">Ações</th></tr></thead>
                  <tbody className="divide-y">
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-1"><input type="text" placeholder="Nome" className="w-full border rounded px-2 py-1" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} /></td>
                        <td className="py-1"><input type="number" min="1" className="w-16 border rounded px-2 py-1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} /></td>
                        <td className="py-1"><input type="number" className="w-24 border rounded px-2 py-1" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} /></td>
                        <td className="py-1 text-right font-medium">{formatCurrency(item.quantity * item.unitCost)}</td>
                        <td className="py-1"><div className="flex justify-center items-center gap-2">
                          <button onClick={() => duplicateItem(idx)} className="text-blue-500 hover:text-blue-700" title="Duplicar"><Copy size={16} /></button>
                          <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700" title="Excluir"><Trash2 size={16} /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1"><Card className="sticky top-6">
          <CardHeader title="Resumo Financeiro" icon={<Calculator />} />
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rateio Custos (Fixos+Var):</span>
              <span className="font-medium">{formatCurrency(financials.fixedCostShare)}</span>
            </div>
            {eventDate && <div className="text-xs text-slate-400 -mt-3 text-right">
              <button onClick={() => setShowCalcMemory(!showCalcMemory)} className="flex items-center gap-1 text-blue-600 hover:underline">
                Ver cálculo <ChevronDown size={14} className={`transition-transform ${showCalcMemory ? 'rotate-180' : ''}`} />
              </button>
            </div>}
            {showCalcMemory && <div className="text-xs bg-slate-50 p-3 rounded-md space-y-1 text-slate-600">
              <p>Custos Fixos (mês): {formatCurrency(financials.calc.relevantFixed)}</p>
              <p>Custos Variáveis (mês): {formatCurrency(financials.calc.relevantVariable)}</p>
              <p className="font-bold">Total (mês): {formatCurrency(financials.calc.totalRelevant)}</p>
              <p className="pt-1 border-t mt-1">Fórmula: {formatCurrency(financials.calc.totalRelevant)} / ({settings.workingDaysPerMonth} dias * {settings.occupancyRate}%)</p>
            </div>}
            <div className="flex justify-between text-sm"><span className="text-slate-500">Custos do Evento (Itens):</span><span className="font-medium">{formatCurrency(financials.eventItemsCost)}</span></div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md"><span className="font-semibold">Custo Total do Evento:</span><span className="font-bold text-red-600">{formatCurrency(financials.totalEventCost)}</span></div>
            <div className="border-t my-2"></div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Margem de Lucro Líquido</label>
              <div className="flex items-center"><Input type="number" value={desiredMargin} onChange={e => setDesiredMargin(e.target.value)} /><span className="ml-2 text-lg font-bold">%</span></div>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex flex-col items-center bg-green-50 p-4 rounded-md">
              <span className="text-sm font-semibold text-green-800">Valor de Venda do Evento</span>
              <span className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(financials.sellingPrice)}</span>
              <span className="text-xs text-green-600 mt-2">Lucro estimado: {formatCurrency(financials.netProfit)}</span>
            </div>
          </CardContent>
        </Card></div>
      </div>
    </div>
  );
};