import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';

export const generateBudgetPDF = (budget: Budget) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Proposta de Orçamento', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 26, { align: 'center' });

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${budget.clientName}`, 14, 40);
  doc.text(`Telefone: ${budget.clientPhone}`, 14, 46);
  doc.text(`Evento: ${budget.eventName}`, 14, 52);
  doc.text(`Data do Evento: ${formatDate(budget.eventDate)}`, 14, 58);
  doc.text(`Convidados: ${budget.guestCount || 0} pessoas`, 14, 64);

  // Table Data (Items)
  // FIX: The `BudgetItem` type doesn't have a `unitPrice`. 
  // We calculate it for presentation by proportionally distributing the total sales amount
  // based on each item's relative cost. If costs are zero, we distribute by quantity.
  const totalVariableCost = budget.totalVariableCost;
  const totalQuantity = budget.items.reduce((sum, item) => sum + item.quantity, 0);

  const tableBody = budget.items.map(item => {
    let itemTotalPrice = 0;

    if (totalVariableCost > 0) {
      const itemTotalCost = item.unitCost * item.quantity;
      const costProportion = itemTotalCost / totalVariableCost;
      itemTotalPrice = budget.totalSales * costProportion;
    } else if (totalQuantity > 0) {
      const quantityProportion = item.quantity / totalQuantity;
      itemTotalPrice = budget.totalSales * quantityProportion;
    }

    const unitPrice = item.quantity > 0 ? itemTotalPrice / item.quantity : 0;
    
    return [
      item.name,
      item.quantity,
      formatCurrency(unitPrice),
      formatCurrency(itemTotalPrice)
    ];
  });

  autoTable(doc, {
    startY: 75,
    head: [['Item', 'Qtd', 'Valor Unit.', 'Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
    styles: { fontSize: 10 },
    foot: [['', '', 'Total Geral', formatCurrency(budget.totalSales)]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Validade da proposta: 15 dias.', 14, finalY + 15);
  doc.text('Agradecemos a preferência!', 14, finalY + 20);

  // Save
  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};
