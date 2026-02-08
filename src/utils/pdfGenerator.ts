import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';

export const generateBudgetPDF = (budget: Budget) => {
  const doc = new jsPDF();

  // Configuração de Cores
  const colorPrimary = [79, 70, 229]; // Indigo
  const colorDark = [40, 40, 40];     
  const colorLight = [100, 100, 100]; 

  // --- CABEÇALHO ---
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(0, 0, 8, 297, 'F'); 

  doc.setFontSize(24);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO DE EVENTO', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 32);

  // --- DADOS DO EVENTO ---
  let currentY = 55;
  const labelX = 20;
  const valueX = 60; 
  const lineHeight = 8;

  const drawInfoRow = (label: string, value: string | number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(label, labelX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(String(value), valueX, currentY);

    currentY += lineHeight;
  };

  drawInfoRow('Cliente:', budget.clientName);
  drawInfoRow('Festa:', budget.eventName);
  drawInfoRow('Telefone:', budget.clientPhone);
  drawInfoRow('Data do Evento:', formatDate(budget.eventDate));
  drawInfoRow('Convidados:', `${budget.guestCount || 0} pessoas`);

  // --- TABELA DE ITENS ---
  const tableStartY = currentY + 10;

  const tableBody = budget.items.map(item => [
    item.name,
    item.quantity
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['DESCRIÇÃO DO ITEM', 'QTD']],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 10,
      font: 'helvetica',
      cellPadding: 4,
      textColor: [50, 50, 50]
    },
    headStyles: {
      fillColor: colorPrimary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    // --- CORREÇÃO AQUI ---
    columnStyles: {
      0: { halign: 'left' },
      // Aumentei o cellWidth para 40 (era 25/30) para caber "R$ 0.000,00" sem quebrar
      1: { halign: 'center', cellWidth: 40 } 
    },
    
    foot: [['TOTAL GERAL', formatCurrency(budget.totalSales)]],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: colorDark,
      fontStyle: 'bold',
      halign: 'right', // Alinha tanto o texto "Total" quanto o Valor à direita
      fontSize: 12
    },
    margin: { left: 20, right: 14 }
  });

  // --- RODAPÉ ---
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(9);
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Validade da proposta: 15 dias.', 20, finalY + 15);
  doc.text('Agradecemos a preferência!', 20, finalY + 20);

  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};