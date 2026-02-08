import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';

export const generateBudgetPDF = (budget: Budget) => {
  const doc = new jsPDF();

  // Configuração de Cores
  const colorPrimary = [79, 70, 229]; // Indigo
  const colorDark = [40, 40, 40];     // Cinza Escuro
  const colorLight = [100, 100, 100]; // Cinza Claro

  // --- CABEÇALHO ---
  // Faixa lateral decorativa (opcional, dá um toque moderno)
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(0, 0, 8, 297, 'F'); // Linha vertical na margem esquerda

  // Título Principal em Negrito
  doc.setFontSize(24);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.setFont('helvetica', 'bold'); // Negrito
  doc.text('ORÇAMENTO DO EVENTO', 20, 25);

  // Subtítulo / Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 32);

  // --- DADOS DO EVENTO (Ordem Solicitada) ---
  let currentY = 55;
  const labelX = 20;
  const valueX = 60; // Alinhamento dos valores
  const lineHeight = 8;

  // Função auxiliar para desenhar linhas: Rótulo em Negrito + Valor Normal
  const drawInfoRow = (label: string, value: string | number) => {
    // Rótulo (Negrito)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(label, labelX, currentY);

    // Valor
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(String(value), valueX, currentY);

    currentY += lineHeight;
  };

  // 1. Cliente
  drawInfoRow('Cliente:', budget.clientName);

  // 2. Festa (Evento)
  drawInfoRow('Festa:', budget.eventName);

  // 3. Telefone
  drawInfoRow('Telefone:', budget.clientPhone);

  // 4. Data do Evento
  drawInfoRow('Data do Evento:', formatDate(budget.eventDate));

  // 5. Convidados
  drawInfoRow('Convidados:', `${budget.guestCount || 0} pessoas`);

  // --- TABELA DE ITENS ---
  // Espaço antes da tabela
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
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', cellWidth: 25 }
    },
    // Rodapé da Tabela com Total
    foot: [['TOTAL GERAL', formatCurrency(budget.totalSales)]],
    footStyles: {
      fillColor: [245, 245, 245], // Cinza muito claro
      textColor: colorDark,
      fontStyle: 'bold',
      halign: 'right',
      fontSize: 12
    },
    margin: { left: 20, right: 14 } // Ajuste da margem esquerda para alinhar com o texto
  });

  // --- RODAPÉ ---
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(9);
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.setFont('helvetica', 'normal');
  
  // Texto de validade e agradecimento
  doc.text('Validade da proposta: 15 dias.', 20, finalY + 15);
  doc.text('Agradecemos a preferência!', 20, finalY + 20);

  // Save
  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};