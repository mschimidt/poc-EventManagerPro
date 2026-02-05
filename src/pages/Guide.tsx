import React from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LayoutDashboard, Settings, Calendar, FileText, DollarSign, Calculator } from 'lucide-react';

export const Guide: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Manual do Sistema</h2>
        <p className="text-slate-500 text-lg">Entenda como utilizar todas as funcionalidades do EventManager Pro.</p>
      </div>

      <Card>
        <CardHeader title="Visão Geral" icon={<LayoutDashboard />} />
        <CardContent>
          <p className="mb-4 text-slate-700 leading-relaxed">
            O <strong>EventManager Pro</strong> foi desenvolvido para ajudar empresas de eventos a precificar corretamente seus serviços, 
            garantindo que todos os custos (fixos e variáveis) sejam cobertos e que a margem de lucro seja real.
          </p>
          <p className="text-slate-700">
            O fluxo de trabalho ideal segue a ordem: <span className="font-semibold bg-slate-100 px-2 py-1 rounded">Custos & Config ➔ Orçamentos ➔ Relatórios</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader title="1. Custos & Configurações" icon={<Settings />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Esta é a área mais importante para a precisão dos cálculos. Antes de fazer orçamentos, você deve alimentar esta tela.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Parâmetros Gerais:</strong> Defina quantos dias úteis sua empresa opera e qual a taxa de ocupação esperada (ex: se você tem capacidade para 10 festas, mas costuma fechar 7, sua ocupação é 70%). Isso afeta o cálculo do rateio de custo fixo.
              </li>
              <li>
                <strong>Custos Fixos Mensais:</strong> Cadastre aluguel, internet, salários, etc. Os custos são agrupados por período (ex: "Fevereiro de 2026") e podem ser expandidos ou recolhidos para facilitar a visualização.
                <br/>
                <span className="text-indigo-600 font-medium">Importante:</span> Você pode cadastrar custos "Recorrentes" (sem data) que se aplicam a todos os meses, ou custos específicos para um Mês/Ano.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader title="2. Orçamentos" icon={<Calendar />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Aqui você cria as propostas para os clientes. O sistema usa um método de "Custo +" para precificar.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Criação:</strong> Preencha os dados do cliente e do evento. Em seguida, adicione cada custo do evento (buffet, decoração, etc.) manualmente, informando o nome, a quantidade e o custo unitário. Você pode duplicar linhas para agilizar.
              </li>
              <li>
                <strong>Cálculo do Custo Total:</strong> O sistema soma todos os itens que você cadastrou e adiciona uma parcela dos seus custos fixos (o "rateio"). O resultado é o <strong>Custo Total do Evento</strong>.
              </li>
              <li>
                <strong>Definição do Preço:</strong> No resumo financeiro, você informa a <strong>Margem de Lucro Líquido</strong> que deseja ter. Com base nisso, o sistema calcula o <strong>Valor de Venda</strong> final a ser cobrado do cliente.
              </li>
              <li>
                <strong>PDF:</strong> Gere um PDF profissional com um clique para enviar ao cliente.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader title="3. Relatórios Financeiros" icon={<FileText />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Analise o resultado real da empresa após a realização dos eventos.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Selecione o Mês e Ano para ver o DRE (Demonstrativo do Resultado do Exercício).
              </li>
              <li>
                O relatório considera apenas orçamentos com status <strong>"Realizado"</strong>.
              </li>
              <li>
                <strong>Margem de Contribuição:</strong> Quanto sobra da receita após pagar os custos variáveis (comida, decoração, etc).
              </li>
              <li>
                <strong>Resultado Líquido:</strong> O lucro real que foi para o bolso, após pagar custos variáveis e todos os custos fixos da empresa.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader title="Dicas Importantes" icon={<Calculator />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Mantenha os status dos orçamentos atualizados. Orçamentos "Declinados" não entram na soma de receita.
              </li>
              <li>
                Se o <strong>Lucro Líquido</strong> no orçamento estiver negativo, significa que a margem de lucro que você definiu não é suficiente para cobrir os custos. Aumente a margem ou reduza os custos.
              </li>
              <li>
                Revise a <strong>% de Ocupação</strong> periodicamente. Se você está trabalhando mais do que o previsto, aumente a porcentagem para que o custo fixo rateado por evento diminua.
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
