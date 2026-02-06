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
  // Simplified view: Only Item Name and Quantity
  const tableBody = budget.items.map(item => [
    item.name,
    item.quantity
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Item', 'Qtd']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
    styles: { fontSize: 10 },
    columnStyles: {
      0: { halign: 'left' }, // Item name alignment
      1: { halign: 'center', cellWidth: 30 } // Quantity alignment and width
    },
    // Footer with Total
    foot: [['Total Geral', formatCurrency(budget.totalSales)]],
    footStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'right' // Align text to right to match the currency column visual
    }
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
