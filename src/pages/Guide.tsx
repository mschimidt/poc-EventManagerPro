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

      {/* Visão Geral */}
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
        
        {/* Módulo 1: Custos e Configurações */}
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
                <strong>Custos Fixos Mensais:</strong> Cadastre aluguel, internet, salários, etc. 
                <br/>
                <span className="text-indigo-600 font-medium">Importante:</span> Você pode cadastrar custos "Recorrentes" (sem data) que se aplicam a todos os meses, ou custos específicos para um Mês/Ano (ex: IPTU em Fevereiro/2026). O sistema usará essa data para calcular o rateio no momento do orçamento.
              </li>
              <li>
                <strong>Itens de Custo Variável (Catálogo):</strong> Cadastre tudo que você vende (Buffet, Decoração, DJ). Informe o <em>Custo Interno</em> (quanto você paga) e o <em>Preço de Venda</em> (quanto você cobra). Isso agiliza a criação de orçamentos.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Módulo 2: Orçamentos */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader title="2. Orçamentos" icon={<Calendar />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Aqui você cria as propostas para os clientes. O sistema calcula automaticamente a lucratividade.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Criação:</strong> Preencha os dados do cliente, data e quantidade de pessoas. Adicione itens do catálogo ou itens personalizados.
              </li>
              <li>
                <strong>Cálculo Automático (Rateio):</strong> O sistema pega todos os Custos Fixos do mês do evento (ou recorrentes) e divide pela capacidade produtiva da empresa.
                <div className="bg-blue-50 p-2 rounded mt-1 text-xs text-blue-800">
                  Fórmula: Custo Fixo Total / (Dias Úteis * % Ocupação)
                </div>
              </li>
              <li>
                <strong>Indicadores em Tempo Real:</strong> Enquanto você monta o orçamento, o sistema mostra se você está tendo lucro ou prejuízo líquido.
              </li>
              <li>
                <strong>PDF:</strong> Gere um PDF profissional com um clique para enviar ao cliente.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Módulo 3: Relatórios */}
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

        {/* Dicas Extras */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader title="Dicas Importantes" icon={<Calculator />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Mantenha os status dos orçamentos atualizados. Orçamentos "Declinados" não entram na soma de receita.
              </li>
              <li>
                Se o <strong>Lucro Líquido</strong> no orçamento estiver vermelho, significa que o preço cobrado não está pagando nem a parcela de custos fixos da empresa para aquele dia.
              </li>
              <li>
                Revise a <strong>% de Ocupação</strong> periodicamente. Se você está trabalhando mais do que o previsto, aumente a porcentagem para que o custo fixo por evento diminua.
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
